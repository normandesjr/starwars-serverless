import * as core from "@aws-cdk/core"
import * as s3 from "@aws-cdk/aws-s3"
import { Function, Runtime, Code } from "@aws-cdk/aws-lambda"
import * as apigateway from "@aws-cdk/aws-apigateway"
// import * as dynamo from "@aws-cdk/aws-dynamodb"
import { EventBus } from "@aws-cdk/aws-events"

export class StarwarsService extends core.Construct {

  constructor(scope: core.Construct, id: string) {
    super(scope, id)

    const bucket = new s3.Bucket(this, "StarwarsGame")

    const newCharacterBus = new EventBus(this, "NewCharacterBus", {
      eventBusName: "NewCharacterBus"
    })

    const createCharacterFunction = new Function(this, "CreateCharacterFunction", {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset("resources"),
      handler: "src/create.main",
      timeout: core.Duration.seconds(30),
      environment: {
        'NEW_CHARACTER_BUS': newCharacterBus.eventBusName
      }
    })
    
    newCharacterBus.grantPutEventsTo(createCharacterFunction)

    const api = new apigateway.RestApi(this, "starwars-api", {
      restApiName: "Starwars Service",
    })

    const getStarwarsIntegration = new apigateway.LambdaIntegration(createCharacterFunction)
    
    const characters = api.root.addResource('characters')
    characters.addMethod('POST', getStarwarsIntegration)    
  }

}