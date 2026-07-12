import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { RequestCodeDto } from './dto/request-code.dto';
import * as bcrypt from 'bcrypt';
import { AccessCodeStatus, UserRole, UserStatus, CodeRequestStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { association: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(`Account status is ${user.status.toLowerCase()}`);
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        association: user.association ? { id: user.association.id, name: user.association.name } : null,
      },
    };
  }

  async verifyAccessCode(verifyCodeDto: VerifyCodeDto) {
    const accessCode = await this.prisma.accessCode.findUnique({
      where: { code: verifyCodeDto.code },
      include: { association: true },
    });

    if (!accessCode) {
      throw new NotFoundException('Invalid Code. Please try again.');
    }

    if (accessCode.status === AccessCodeStatus.USED) {
      throw new BadRequestException('This access code has already been used.');
    }

    if (accessCode.status === AccessCodeStatus.EXPIRED || new Date() > accessCode.expiresAt) {
      // Auto-update to expired if not already done
      if (accessCode.status !== AccessCodeStatus.EXPIRED) {
        await this.prisma.accessCode.update({
          where: { id: accessCode.id },
          data: { status: AccessCodeStatus.EXPIRED },
        });
      }
      throw new BadRequestException('This access code has expired.');
    }

    return {
      code: accessCode.code,
      memberName: accessCode.memberName,
      email: accessCode.email,
      phone: accessCode.phone,
      association: {
        id: accessCode.association.id,
        name: accessCode.association.name,
        code: accessCode.association.code,
      },
    };
  }

  async createAccount(createAccountDto: CreateAccountDto) {
    const { code, email, firstName, lastName, phone, password, confirmPassword } = createAccountDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // 1. Verify code again
    const accessCode = await this.prisma.accessCode.findUnique({
      where: { code },
    });

    if (!accessCode || accessCode.status !== AccessCodeStatus.PENDING || new Date() > accessCode.expiresAt) {
      throw new BadRequestException('Invalid or expired access code');
    }

    // 2. Check if email is already taken
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('A user with this email address already exists');
    }

    // 3. Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        associationId: accessCode.associationId,
        accessCodeId: accessCode.id,
        firstName,
        lastName,
        email,
        phone,
        passwordHash,
        role: UserRole.RESIDENT,
        status: UserStatus.ACTIVE,
      },
    });

    // 4. Mark code as used
    await this.prisma.accessCode.update({
      where: { id: accessCode.id },
      data: {
        status: AccessCodeStatus.USED,
        usedAt: new Date(),
      },
    });

    // 5. Generate token
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async requestCode(requestCodeDto: RequestCodeDto) {
    // Check if association exists
    const association = await this.prisma.association.findUnique({
      where: { id: requestCodeDto.associationId },
    });

    if (!association) {
      throw new NotFoundException('Association not found');
    }

    // Check if request already exists for this email
    const existingRequest = await this.prisma.codeRequest.findFirst({
      where: {
        email: requestCodeDto.email,
        associationId: requestCodeDto.associationId,
        status: CodeRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('You have already requested an access code for this association. Please wait for approval.');
    }

    // Store in DB
    const request = await this.prisma.codeRequest.create({
      data: {
        associationId: requestCodeDto.associationId,
        name: requestCodeDto.name,
        email: requestCodeDto.email,
        phone: requestCodeDto.phone,
        status: CodeRequestStatus.PENDING,
      },
    });

    return {
      message: 'Your request has been submitted successfully. Admin will review and share the code via email.',
      requestId: request.id,
    };
  }
}
