import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { RequestCodeDto } from './dto/request-code.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Email and Password' })
  @ApiResponse({ status: 200, description: 'User successfully logged in, returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or inactive account' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('access-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate Access Code & Get Preloaded Details' })
  @ApiResponse({ status: 200, description: 'Code is valid, returns preloaded details' })
  @ApiResponse({ status: 400, description: 'Invalid code, expired, or already used' })
  verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyAccessCode(verifyCodeDto);
  }

  @Public()
  @Post('create-account')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Account after validating details and password requirements' })
  @ApiResponse({ status: 201, description: 'User account created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed, email taken or invalid/expired code' })
  createAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.authService.createAccount(createAccountDto);
  }

  @Public()
  @Post('request-code')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request an Access Code if not onboarding via portal' })
  @ApiResponse({ status: 201, description: 'Request submitted successfully' })
  @ApiResponse({ status: 400, description: 'Request already exists' })
  requestCode(@Body() requestCodeDto: RequestCodeDto) {
    return this.authService.requestCode(requestCodeDto);
  }
}
