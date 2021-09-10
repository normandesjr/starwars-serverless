import * as core from "@aws-cdk/core"
import * as s3 from "@aws-cdk/aws-s3"
import { Function, Runtime, Code } from "@aws-cdk/aws-lambda"
import * as apigateway from "@aws-cdk/aws-apigateway"
import { Table, AttributeType } from "@aws-cdk/aws-dynamodb"
import { EventBus, Rule } from "@aws-cdk/aws-events"
import { LambdaFunction } from '@aws-cdk/aws-events-targets';

export class StarwarsService extends core.Construct {

  constructor(scope: core.Construct, id: string) {
    super(scope, id)

    const bucket = new s3.Bucket(this, "StarwarsGame")

    const starwarsTable = new Table(this, "StarwarsTable", {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING }
    })

    const newCharacterBus = new EventBus(this, "NewCharacterBus", {
      eventBusName: "NewCharacterBus"
    })

    const putCharacterFunction = new Function(this, "PutCharacterFunction", {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset("src/put-character"),
      handler: "put-character-function.main",
      timeout: core.Duration.seconds(30),
      environment: {
        'NEW_CHARACTER_BUS': newCharacterBus.eventBusName,
        'SWAPI_BASE_URL': 'https://swapi.dev/api'
      }
    })
    
    newCharacterBus.grantPutEventsTo(putCharacterFunction)

    const saveCharacterFunction = new Function(this, "SaveCharacterFunction", {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset("src/save-character"),
      handler: "save-character-function.main",
      timeout: core.Duration.seconds(30),
      environment: {
        'TABLE_NAME': starwarsTable.tableName
      }
    })

    starwarsTable.grantWriteData(saveCharacterFunction)

    // Event Bridge Rule
    new Rule(this, "SaveCharacterRule", {
      eventBus: newCharacterBus,
      eventPattern: { detailType: ["character"]},
      targets: [ new LambdaFunction(saveCharacterFunction) ]
    })


    const api = new apigateway.RestApi(this, "starwars-api", {
      restApiName: "Starwars Service",
    })

    const getStarwarsIntegration = new apigateway.LambdaIntegration(putCharacterFunction)
    
    const characters = api.root.addResource('characters')
    characters.addMethod('POST', getStarwarsIntegration)    
  }

}