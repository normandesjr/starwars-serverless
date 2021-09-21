import * as core from "@aws-cdk/core"
import { ServicePrincipal } from '@aws-cdk/aws-iam'
import { Function, Runtime, Code } from "@aws-cdk/aws-lambda"
import { SpecRestApi, AssetApiDefinition } from "@aws-cdk/aws-apigateway"
import { Table, AttributeType } from "@aws-cdk/aws-dynamodb"
import { Queue } from "@aws-cdk/aws-sqs"
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources'

export class StarwarsService extends core.Construct {

  constructor(scope: core.Construct, id: string) {
    super(scope, id)

    const userCharacterTable = new Table(this, "UserCharacterTable", {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
    })

    const newCharacterQueue = new Queue(this, 'NewCharacterQueue')

    const postCharacterFunction = new Function(this, "PostCharacterFunction", {
      functionName: 'PostCharacterFunction',
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset("src"),
      handler: "post-character/post-character-function.main",
      timeout: core.Duration.seconds(30),
      environment: {
        'NEW_CHARACTER_QUEUE': newCharacterQueue.queueUrl,
        'SWAPI_BASE_URL': 'https://swapi.dev/api'
      }
    })

    newCharacterQueue.grantSendMessages(postCharacterFunction)

    const saveCharacterFunction = new Function(this, "SaveCharacterFunction", {
      functionName: 'SaveCharacterFunction',
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset("src"),
      handler: "save-character/save-character-function.main",
      timeout: core.Duration.seconds(30),
      environment: {
        'TABLE_NAME': userCharacterTable.tableName
      }
    })

    saveCharacterFunction.addEventSource(
      new SqsEventSource(newCharacterQueue)
    )

    userCharacterTable.grantWriteData(saveCharacterFunction)

    const getCharactersFunction = new Function(this, "GetCharactersFunction", {
      functionName: 'GetCharactersFunction',
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset("src"),
      handler: "get-character/get-characters-function.main",
      timeout: core.Duration.seconds(30),
      environment: {
        'TABLE_NAME': userCharacterTable.tableName
      }
    })

    userCharacterTable.grantReadData(getCharactersFunction)

    const spec = new SpecRestApi(this, 'StarwarsServerlessAPI', {
      restApiName: 'Starwars Serverless API',
      apiDefinition: AssetApiDefinition.fromAsset("spec/starwars-definition.yaml"),
      deploy: true
    })

    postCharacterFunction.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));
    getCharactersFunction.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));
  }

}
