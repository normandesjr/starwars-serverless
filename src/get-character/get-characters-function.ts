import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb'

const dynamoDBClient = new DynamoDBClient({})
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDBClient)

export const main: APIGatewayProxyHandlerV2<APIGatewayProxyResultV2> = async(event: APIGatewayProxyEventV2) => {

  const user = event.queryStringParameters?.user ?? ''
  const person = event.queryStringParameters?.person ?? ''

  const params:QueryCommandInput = {
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
      '#pk': 'pk'
    },
    ExpressionAttributeValues: {
      ':pk': user
    }
  };
  
  
  console.log('params...!!', params)

  const data = await ddbDocClient.send(new QueryCommand(params));
  console.log('data...', data)
  
  return { 
    body: JSON.stringify(data.Items),
    statusCode: 200
  }

}