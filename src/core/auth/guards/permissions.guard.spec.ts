import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  const mockReflector = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const createMockExecutionContext = (user?: any): ExecutionContext => {
      return {
        switchToHttp: () => ({
          getRequest: () => ({ user }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;
    };

    it('should allow access when no permissions are required', () => {
      mockReflector.get.mockReturnValue(undefined);
      const context = createMockExecutionContext();

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when empty permissions array is required', () => {
      mockReflector.get.mockReturnValue([]);
      const context = createMockExecutionContext();

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has required permissions', () => {
      const requiredPermissions = ['read', 'write'];
      const userWithPermissions = {
        role: {
          permissions: [
            { permissionName: 'read' },
            { permissionName: 'write' },
            { permissionName: 'admin' }
          ]
        }
      };

      mockReflector.get.mockReturnValue(requiredPermissions);
      const context = createMockExecutionContext(userWithPermissions);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user lacks required permissions', () => {
      const requiredPermissions = ['admin', 'delete'];
      const userWithLimitedPermissions = {
        role: {
          permissions: [
            { permissionName: 'read' },
            { permissionName: 'write' }
          ]
        }
      };

      mockReflector.get.mockReturnValue(requiredPermissions);
      const context = createMockExecutionContext(userWithLimitedPermissions);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw TypeError when user has no role', () => {
      const requiredPermissions = ['read'];
      const userWithoutRole = {};

      mockReflector.get.mockReturnValue(requiredPermissions);
      const context = createMockExecutionContext(userWithoutRole);

      expect(() => guard.canActivate(context)).toThrow(TypeError);
    });

    it('should throw ForbiddenException when user has role but no permissions', () => {
      const requiredPermissions = ['read'];
      const userWithEmptyPermissions = {
        role: {
          permissions: []
        }
      };

      mockReflector.get.mockReturnValue(requiredPermissions);
      const context = createMockExecutionContext(userWithEmptyPermissions);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when no user is provided', () => {
      const requiredPermissions = ['read'];

      mockReflector.get.mockReturnValue(requiredPermissions);
      const context = createMockExecutionContext(null);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});