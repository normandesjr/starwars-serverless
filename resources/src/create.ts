import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import axios, { AxiosResponse } from 'axios'
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge'

interface Character {
  user: string,
  swapi_id: number
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
  swapi_id: number
}

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

  const eventBridgeClient = new EventBridgeClient({})
  const eventBridgeCommand = new PutEventsCommand({Entries: [{
    EventBusName: process.env.NEW_CHARACTER_BUS,
    Detail: JSON.stringify(fullCharacter),
    DetailType: 'character',
    Source: 'game'
  }]})

  await eventBridgeClient.send(eventBridgeCommand)

  return { 
    body: newCharacter.user,
    statusCode: people.status
  }
}