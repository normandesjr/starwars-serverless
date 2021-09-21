import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import axios, { AxiosResponse } from 'axios'
import * as sqs from '@aws-sdk/client-sqs'
import { captureAWSv3Client } from 'aws-xray-sdk-core'

interface Character {
  user: string,
  swapi_id: string
}

interface People {
  name: string,
  height: string,
  gender: string
}  

interface FullCharacter {
  user: string,
  character: string,
  height: string,
  gender: string,
  swapi_id: string
}

const sqsClient = captureAWSv3Client(new sqs.SQSClient({}))

export const main: APIGatewayProxyHandlerV2<APIGatewayProxyResultV2> = async(event: APIGatewayProxyEventV2) => {

  const requestBody = JSON.parse(event.body ?? '{}')
  const newCharacter:Character = { user: requestBody.user, swapi_id: requestBody.swapi_id }

  const people: AxiosResponse<People> = await axios.get(`${process.env.SWAPI_BASE_URL}/people/${newCharacter.swapi_id}`)

  const fullCharacter:FullCharacter = { 
    user: newCharacter.user, 
    character: people.data.name, 
    height: people.data.height, 
    gender: people.data.gender, 
    swapi_id: newCharacter.swapi_id }

    sqsClient.send(new sqs.SendMessageCommand({
      QueueUrl: process.env.NEW_CHARACTER_QUEUE,
      MessageBody: JSON.stringify(fullCharacter)
    }))

  return { 
    body: JSON.stringify({
      name: fullCharacter.character,
      height: fullCharacter.height,
      gender: fullCharacter.gender
    }),
    statusCode: people.status
  }
}