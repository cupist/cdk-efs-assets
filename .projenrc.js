const {
  AwsCdkConstructLibrary,
  DevEnvironmentDockerImage,
  Gitpod,
} = require('projen');

const AUTOMATION_TOKEN = 'AUTOMATION_GITHUB_TOKEN';

const project = new AwsCdkConstructLibrary({
  authorAddress: 'pahudnet@gmail.com',
  authorName: 'Pahud Hsieh',
  cdkVersion: '1.101.0',
  name: 'cdk-efs-assets',
  repository: 'https://github.com/pahud/cdk-efs-assets.git',
  description: 'Amazon EFS assets from Github repositories or S3 buckets',
  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-ecs',
    '@aws-cdk/aws-efs',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-logs',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-ecs-patterns',
    '@aws-cdk/aws-events-targets',
    '@aws-cdk/aws-secretsmanager',
    '@aws-cdk/custom-resources',
  ],
  deps: ['cdk-fargate-run-task'],
  peerDeps: ['cdk-fargate-run-task'],
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
      secret: AUTOMATION_TOKEN,
    },
  },
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['pahud', 'cdk-automation'],
  },
  defaultReleaseBranch: 'main',
  keywords: [
    'aws',
    'cdk',
    'efs',
    'github',
  ],

  catalog: {
    twitter: 'pahudnet',
    announce: false,
  },

  python: {
    distName: 'cdk-efs-assets',
    module: 'cdk_efs_assets',
  },
});

project.package.addField('resolutions', {
  'pac-resolver': '^5.0.0',
  'set-value': '^4.0.1',
  'ansi-regex': '^5.0.1',
});


const gitpodPrebuild = project.addTask('gitpod:prebuild', {
  description: 'Prebuild setup for Gitpod',
});
// install and compile only, do not test or package.
gitpodPrebuild.exec('yarn install');
gitpodPrebuild.exec('npx projen compile');

let gitpod = new Gitpod(project, {
  dockerImage: DevEnvironmentDockerImage.fromImage('public.ecr.aws/pahudnet/gitpod-workspace:latest'),
  prebuilds: {
    addCheck: true,
    addBadge: true,
    addLabel: true,
    branches: true,
    pullRequests: true,
    pullRequestsFromForks: true,
  },
});

gitpod.addCustomTask({
  init: 'yarn gitpod:prebuild',
  // always upgrade after init
  command: 'npx projen upgrade',
});

gitpod.addVscodeExtensions(
  'dbaeumer.vscode-eslint',
  'ms-azuretools.vscode-docker',
  'AmazonWebServices.aws-toolkit-vscode',
);


const common_exclude = ['cdk.out', 'cdk.context.json', 'images', 'yarn-error.log', '*.zip'];
project.npmignore.exclude(...common_exclude);
project.gitignore.exclude(...common_exclude);

project.synth();
