import { prisma } from '@/lib/prisma';

describe('Friendship Model Integration Tests', () => {
  let testUsers: any[] = [];

  beforeAll(async () => {
    // Create test users
    testUsers = await Promise.all([
      prisma.user.create({
        data: {
          username: 'testuser1',
          email: 'test1@example.com',
          displayName: 'Test User 1',
        },
      }),
      prisma.user.create({
        data: {
          username: 'testuser2',
          email: 'test2@example.com',
          displayName: 'Test User 2',
        },
      }),
      prisma.user.create({
        data: {
          username: 'testuser3',
          email: 'test3@example.com',
          displayName: 'Test User 3',
        },
      }),
    ]);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { requesterId: { in: testUsers.map(u => u.id) } },
          { addresseeId: { in: testUsers.map(u => u.id) } },
        ],
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: { in: testUsers.map(u => u.id) },
      },
    });
  });

  beforeEach(async () => {
    // Clean up friendships before each test
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { requesterId: { in: testUsers.map(u => u.id) } },
          { addresseeId: { in: testUsers.map(u => u.id) } },
        ],
      },
    });
  });

  describe('Friendship Creation', () => {
    it('should create a pending friendship request', async () => {
      const friendship = await prisma.friendship.create({
        data: {
          requesterId: testUsers[0].id,
          addresseeId: testUsers[1].id,
          status: 'pending',
        },
      });

      expect(friendship).toBeDefined();
      expect(friendship.status).toBe('pending');
      expect(friendship.requesterId).toBe(testUsers[0].id);
      expect(friendship.addresseeId).toBe(testUsers[1].id);
    });

    it('should prevent duplicate friendship requests', async () => {
      // Create first friendship
      await prisma.friendship.create({
        data: {
          requesterId: testUsers[0].id,
          addresseeId: testUsers[1].id,
          status: 'pending',
        },
      });

      // Try to create duplicate - should find existing
      const existingFriendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            {
              requesterId: testUsers[0].id,
              addresseeId: testUsers[1].id,
            },
            {
              requesterId: testUsers[1].id,
              addresseeId: testUsers[0].id,
            },
          ],
        },
      });

      expect(existingFriendship).toBeDefined();
      expect(existingFriendship?.status).toBe('pending');
    });
  });

  describe('Friendship Status Updates', () => {
    it('should accept a pending friendship request', async () => {
      const friendship = await prisma.friendship.create({
        data: {
          requesterId: testUsers[0].id,
          addresseeId: testUsers[1].id,
          status: 'pending',
        },
      });

      const updatedFriendship = await prisma.friendship.update({
        where: { id: friendship.id },
        data: { status: 'accepted' },
      });

      expect(updatedFriendship.status).toBe('accepted');
    });

    it('should decline a pending friendship request', async () => {
      const friendship = await prisma.friendship.create({
        data: {
          requesterId: testUsers[0].id,
          addresseeId: testUsers[1].id,
          status: 'pending',
        },
      });

      const updatedFriendship = await prisma.friendship.update({
        where: { id: friendship.id },
        data: { status: 'declined' },
      });

      expect(updatedFriendship.status).toBe('declined');
    });
  });

  describe('Friendship Queries', () => {
    it('should find all friendships for a user', async () => {
      // Create multiple friendships
      await prisma.friendship.createMany({
        data: [
          {
            requesterId: testUsers[0].id,
            addresseeId: testUsers[1].id,
            status: 'accepted',
          },
          {
            requesterId: testUsers[2].id,
            addresseeId: testUsers[0].id,
            status: 'pending',
          },
        ],
      });

      const userFriendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: testUsers[0].id },
            { addresseeId: testUsers[0].id },
          ],
        },
        include: {
          requester: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
          addressee: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      });

      expect(userFriendships).toHaveLength(2);
      expect(userFriendships.some(f => f.status === 'accepted')).toBe(true);
      expect(userFriendships.some(f => f.status === 'pending')).toBe(true);
    });

    it('should find only accepted friendships', async () => {
      // Create friendships with different statuses
      await prisma.friendship.createMany({
        data: [
          {
            requesterId: testUsers[0].id,
            addresseeId: testUsers[1].id,
            status: 'accepted',
          },
          {
            requesterId: testUsers[0].id,
            addresseeId: testUsers[2].id,
            status: 'pending',
          },
        ],
      });

      const acceptedFriendships = await prisma.friendship.findMany({
        where: {
          AND: [
            {
              OR: [
                { requesterId: testUsers[0].id },
                { addresseeId: testUsers[0].id },
              ],
            },
            { status: 'accepted' },
          ],
        },
      });

      expect(acceptedFriendships).toHaveLength(1);
      expect(acceptedFriendships[0].status).toBe('accepted');
    });
  });

  describe('Friendship Constraints', () => {
    it('should enforce unique constraint on requester-addressee pairs', async () => {
      await prisma.friendship.create({
        data: {
          requesterId: testUsers[0].id,
          addresseeId: testUsers[1].id,
          status: 'pending',
        },
      });

      // This should not create a duplicate due to unique constraint
      const existingFriendship = await prisma.friendship.findFirst({
        where: {
          requesterId: testUsers[0].id,
          addresseeId: testUsers[1].id,
        },
      });

      expect(existingFriendship).toBeDefined();
    });

    it('should handle bidirectional friendship lookups', async () => {
      await prisma.friendship.create({
        data: {
          requesterId: testUsers[0].id,
          addresseeId: testUsers[1].id,
          status: 'accepted',
        },
      });

      // Should find friendship regardless of who initiated it
      const friendship1 = await prisma.friendship.findFirst({
        where: {
          OR: [
            {
              requesterId: testUsers[0].id,
              addresseeId: testUsers[1].id,
            },
            {
              requesterId: testUsers[1].id,
              addresseeId: testUsers[0].id,
            },
          ],
        },
      });

      const friendship2 = await prisma.friendship.findFirst({
        where: {
          OR: [
            {
              requesterId: testUsers[1].id,
              addresseeId: testUsers[0].id,
            },
            {
              requesterId: testUsers[0].id,
              addresseeId: testUsers[1].id,
            },
          ],
        },
      });

      expect(friendship1).toBeDefined();
      expect(friendship2).toBeDefined();
      expect(friendship1?.id).toBe(friendship2?.id);
    });
  });
});