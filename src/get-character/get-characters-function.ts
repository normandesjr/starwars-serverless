import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda'

export const main: APIGatewayProxyHandlerV2<APIGatewayProxyResultV2> = async(event: APIGatewayProxyEventV2) => {

  console.log(event)
  
  return { 
    body: "OK",
    statusCode: 200
  }

}