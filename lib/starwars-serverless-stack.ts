import * as cdk from '@aws-cdk/core';
import { StarwarsService } from './starwars-service';

export class StarwarsServerlessStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new StarwarsService(this, "StarwarsServerlessAPI")
  }
}
