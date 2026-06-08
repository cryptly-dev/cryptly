import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthCoreModule } from './auth/core/auth-core.module';
import { GithubAuthModule } from './auth/github/github-auth.module';
import { GoogleAuthModule } from './auth/google/google-auth.module';
import { LocalAuthModule } from './auth/local/local-auth.module';
import { RefreshTokenCoreModule } from './auth/refresh-token/core/refresh-token-core.module';
import { HealthModule } from './health/health.module';
import { InvitationCoreModule } from './invitation/core/invitation-core.module';
import { PersonalInvitationCoreModule } from './personal-invitation/core/personal-invitation-core.module';
import { ProjectSecretsVersionCoreModule } from './project-secrets-version/core/project-secrets-version-core.module';
import { ProjectCoreModule } from './project/core/project-core.module';
import { getEnvConfig } from './shared/config/env-config';
import { LogdashModule } from './shared/logdash/logdash.module';
import { UserCoreModule } from './user/core/user-core.module';
import { GithubExternalConnectionCoreModule } from './external-connection/github/core/github-external-connection-core.module';
import { BlogCoreModule } from './blog/core/blog-core.module';
import { StatsModule } from './stats/stats.module';
import { PosthogAnalyticsModule } from './shared/posthog/posthog-analytics.module';

@Module({
  imports: [
    MongooseModule.forRoot(getEnvConfig().mongo.url),
    PosthogAnalyticsModule,
    UserCoreModule,
    ProjectCoreModule,
    ProjectSecretsVersionCoreModule,
    InvitationCoreModule,
    PersonalInvitationCoreModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AuthCoreModule,
    LogdashModule,
    GoogleAuthModule,
    GithubAuthModule,
    LocalAuthModule,
    RefreshTokenCoreModule,
    HealthModule,
    GithubExternalConnectionCoreModule,
    BlogCoreModule,
    StatsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
