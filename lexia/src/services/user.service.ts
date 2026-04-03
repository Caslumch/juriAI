import { hash } from "bcryptjs";
import { createLogger } from "@/lib/logger";
import { userRepository } from "@/repositories/user.repository";
import { logRepository } from "@/repositories/log.repository";
import { ValidationError, NotFoundError } from "@/lib/errors";
import type { Role } from "@/generated/prisma/client";

const log = createLogger("user");

export const userService = {
  async getUsers(filters: Parameters<typeof userRepository.findMany>[0]) {
    return userRepository.findMany(filters);
  },

  async createUser(
    data: { name: string; email: string; password: string; role?: Role },
    adminId: string,
  ) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ValidationError("Este email já está cadastrado");
    }

    const passwordHash = await hash(data.password, 12);

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    });

    await logRepository.create({
      action: "USER_CREATED",
      userId: adminId,
      metadata: { targetUserId: user.id, email: user.email, role: data.role },
    });

    log.info(
      { targetUserId: user.id, role: data.role },
      "User created by admin",
    );

    return user;
  },

  async updateUser(
    data: { id: string; name?: string; email?: string; role?: Role },
    adminId: string,
  ) {
    const { id, ...changes } = data;

    if (changes.email) {
      const existing = await userRepository.findByEmail(changes.email);
      if (existing && existing.id !== id) {
        throw new ValidationError("Este email já está cadastrado");
      }
    }

    await userRepository.update(id, changes);

    await logRepository.create({
      action: "USER_UPDATED",
      userId: adminId,
      metadata: { targetUserId: id, changes },
    });

    log.info({ targetUserId: id }, "User updated by admin");
  },

  async toggleActive(userId: string, adminId: string) {
    if (userId === adminId) {
      throw new ValidationError("Você não pode desativar sua própria conta");
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    const { isActive, role } = user;

    if (isActive && role === "ADMIN") {
      const activeAdmins = await userRepository.countActiveAdmins();
      if (activeAdmins <= 1) {
        throw new ValidationError(
          "Não é possível desativar o último administrador ativo",
        );
      }
    }

    await userRepository.toggleActive(userId, !isActive);

    const action = isActive ? "USER_DEACTIVATED" : "USER_ACTIVATED";
    await logRepository.create({
      action,
      userId: adminId,
      metadata: { targetUserId: userId },
    });

    log.info({ targetUserId: userId, action }, "User status toggled");
  },

  async register(data: { name: string; email: string; password: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ValidationError("Este email já está cadastrado");
    }

    const passwordHash = await hash(data.password, 12);

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    log.info({ userId: user.id }, "New user registered");

    return user;
  },
};
