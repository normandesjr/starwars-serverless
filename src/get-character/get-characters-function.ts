import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { captureAWSv3Client } from 'aws-xray-sdk-core'

const dynamoDBClient = new DynamoDBClient({})
const ddbDocClient = captureAWSv3Client(DynamoDBDocumentClient.from(dynamoDBClient))

export const main: APIGatewayProxyHandlerV2<APIGatewayProxyResultV2> = async(event: APIGatewayProxyEventV2) => {

  const user = event.queryStringParameters?.user ?? ''

  const params:QueryCommandInput = {
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': user
    }
  }

  const data = await ddbDocClient.send(new QueryCommand(params));
  
  return { 
    body: JSON.stringify(data.Items),
    statusCode: 200
  }

}