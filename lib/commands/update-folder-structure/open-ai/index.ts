import { encode } from 'gpt-3-encoder'
import axios from './axios-instance'
import { ChatMessage } from '../../../types'

export const fetchChatCompletion = async (
  messages: ChatMessage[],
): Promise<any> => {
  const messagesTokenCount = getTokenCountForMessages(messages)

  const minResponseTokens = 2000
  const remainingTokens =
    MAX_GPT_4_TOKENS - messagesTokenCount - minResponseTokens

  console.log({ messagesTokenCount, remainingTokens })

  if (remainingTokens <= 0) {
    throw new Error(
      'Not enough tokens to call GPT-4 - try running on child folders of the current folder instead',
    )
  }

  try {
    console.log('Calling GPT-4...')
    const { data } = await axios.post(
      OPENAI_CHAT_COMPLETIONS_URL,
      {
        model: 'gpt-4',
        messages,
        max_tokens: Math.max(remainingTokens, minResponseTokens),
        temperature: 0.0,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
        },
      },
    )

    if (Array.isArray(data?.choices) && data.choices.length > 0) {
      const messageContent = data.choices[0].message.content

      return messageContent
    } else {
      throw new Error('No choices returned from GPT-4')
    }
  } catch (error) {
    console.log('Error calling GPT-4: ', (error as any).response?.data)
    console.log(error)
    return 'Error calling GPT-4'
  }
}

const getTokenCountForMessages = (messages: ChatMessage[]) =>
  encode(
    messages.map((m) => `role: ${m.role}, content: ${m.content}`).join('\n'),
  ).length

const MAX_GPT_4_TOKENS = 8192

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions'
