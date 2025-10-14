import { Logger, Metrics } from '@logdash/js-sdk';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { getModelToken } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import * as nock from 'nock';
import { GithubAuthModule } from '../../src/auth/github/github-auth.module';
import { GoogleAuthModule } from '../../src/auth/google/google-auth.module';
import { HealthModule } from '../../src/health/health.module';
import { InvitationCoreModule } from '../../src/invitation/core/invitation-core.module';
import { PROJECT_HISTORY_SIZE } from '../../src/project-secrets-version/write/project-secrets-version.constants';
import { ProjectCoreModule } from '../../src/project/core/project-core.module';
import { LogdashModule } from '../../src/shared/logdash/logdash.module';
import { UserEntity } from '../../src/user/core/entities/user.entity';
import { UserCoreModule } from '../../src/user/core/user-core.module';
import { AuthCoreModule } from '../../src/auth/core/auth-core.module';
import { InvitationUtils } from './invitation.utils';
import { LoggerMock } from './mocks/logger-mock';
import { MetricsMock } from './mocks/metrics-mock';
import { closeInMemoryMongoServer, rootMongooseTestModule } from './mongo-in-memory-server';
import { ProjectUtils } from './project.utils';
import { UserUtils } from './user.utils';
import { GithubExternalConnectionClientService } from '../../src/external-connection/github/client/github-external-connection-client.service';
import { githubExternalConnectionClientMock } from './mocks/github-client-mock';
import { GithubExternalConnectionCoreModule } from '../../src/external-connection/github/core/github-external-connection-core.module';
import { GithubExternalConnectionUtils } from './github-external-connection.utils';
import { ProjectEntity } from '../../src/project/core/entities/project.entity';
import { GithubIntegrationEntity } from '../../src/external-connection/github/core/entities/github-integration.entity';
import { GithubInstallationEntity } from '../../src/external-connection/github/core/entities/github-installation.entity';
import { PersonalInvitationCoreModule } from '../../src/personal-invitation/core/personal-invitation-core.module';
import { PersonalInvitationUtils } from './personal-invitation.utils';
import { PersonalInvitationEntity } from '../../src/personal-invitation/core/entities/personal-invitation.entity';

export interface TestApp {
  app: INestApplication;
  module: TestingModule;
  models: {
    userModel: Model<UserEntity>;
    projectModel: Model<ProjectEntity>;
    githubIntegrationModel: Model<GithubIntegrationEntity>;
    githubInstallationModel: Model<GithubInstallationEntity>;
    personalInvitationModel: Model<PersonalInvitationEntity>;
  };
  utils: {
    userUtils: UserUtils;
    projectUtils: ProjectUtils;
    invitationUtils: InvitationUtils;
    personalInvitationUtils: PersonalInvitationUtils;
    githubExternalConnectionUtils: GithubExternalConnectionUtils;
  };
  methods: {
    clearDatabase: () => Promise<void>;
    beforeEach: () => Promise<void>;
    afterAll: () => Promise<void>;
  };
}

export async function createTestApp(): Promise<TestApp> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      rootMongooseTestModule(),
      UserCoreModule,
      ProjectCoreModule,
      InvitationCoreModule,
      PersonalInvitationCoreModule,
      ScheduleModule.forRoot(),
      EventEmitterModule.forRoot(),
      AuthCoreModule,
      LogdashModule,
      GoogleAuthModule,
      GithubAuthModule,
      HealthModule,
      GithubExternalConnectionCoreModule,
    ],
  })
    .overrideProvider(Logger)
    .useClass(LoggerMock)
    .overrideProvider(Metrics)
    .useClass(MetricsMock)
    .overrideProvider(PROJECT_HISTORY_SIZE)
    .useValue(2)
    .overrideProvider(GithubExternalConnectionClientService)
    .useValue(githubExternalConnectionClientMock)
    .compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.init();

  const userModel: Model<UserEntity> = module.get(getModelToken(UserEntity.name));
  const projectModel: Model<ProjectEntity> = module.get(getModelToken(ProjectEntity.name));
  const githubIntegrationModel: Model<GithubIntegrationEntity> = module.get(
    getModelToken(GithubIntegrationEntity.name),
  );
  const githubInstallationModel: Model<GithubInstallationEntity> = module.get(
    getModelToken(GithubInstallationEntity.name),
  );
  const personalInvitationModel: Model<PersonalInvitationEntity> = module.get(
    getModelToken(PersonalInvitationEntity.name),
  );

  const clearDatabase = async () => {
    await Promise.all([
      userModel.deleteMany({}),
      projectModel.deleteMany({}),
      githubIntegrationModel.deleteMany({}),
      githubInstallationModel.deleteMany({}),
      personalInvitationModel.deleteMany({}),
    ]);
  };

  const beforeEach = async () => {
    const { clear } = await import('jest-date-mock');
    clear();
    await clearDatabase();
    nock.cleanAll();
  };

  const afterAll = async () => {
    await app.close();
    await closeInMemoryMongoServer();
    const { clear } = await import('jest-date-mock');
    clear();
  };

  const userUtils = new UserUtils(app);
  const projectUtils = new ProjectUtils(app, userUtils);

  return {
    app,
    module,
    models: {
      userModel,
      projectModel,
      githubIntegrationModel,
      githubInstallationModel,
      personalInvitationModel,
    },
    utils: {
      userUtils: userUtils,
      projectUtils: projectUtils,
      invitationUtils: new InvitationUtils(app),
      personalInvitationUtils: new PersonalInvitationUtils(app),
      githubExternalConnectionUtils: new GithubExternalConnectionUtils(app),
    },
    methods: {
      clearDatabase,
      beforeEach,
      afterAll,
    },
  };
}
