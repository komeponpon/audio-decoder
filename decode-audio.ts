import fs from 'fs'
import path from 'path'

interface DecodeOptions {
  base64Data: string
  outputPath?: string
  mimeType?: string
}

interface AudioResponse {
  audio: string
}

/**
 * Base64エンコードされた音声データをデコードして再生・保存する
 */
async function decodeAudio({ base64Data, outputPath, mimeType = 'audio/wav' }: DecodeOptions) {
  try {
    // Base64データをデコード
    const binaryData = Buffer.from(base64Data, 'base64')

    // 出力パスが指定されている場合はファイルとして保存
    if (outputPath) {
      const fullPath = path.resolve(outputPath)
      fs.writeFileSync(fullPath, binaryData)
      console.log(`音声ファイルを保存しました: ${fullPath}`)
    }

    // 音声データの情報を表示
    console.log('音声データの情報:')
    console.log(`- サイズ: ${binaryData.length} バイト`)
    console.log(`- MIMEタイプ: ${mimeType}`)

    return {
      success: true,
      data: binaryData,
      size: binaryData.length
    }
  } catch (error) {
    console.error('デコード中にエラーが発生しました:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー'
    }
  }
}

// 使用例
async function main() {
  // JSONファイルから音声データを読み込む
  const jsonPath = process.argv[2] || './response.json'
  
  try {
    // JSONファイルを読み込む
    const jsonData = fs.readFileSync(jsonPath, 'utf-8')
    const response: AudioResponse = JSON.parse(jsonData)
    
    if (!response.audio) {
      throw new Error('JSONにaudioフィールドが存在しません')
    }

    const result = await decodeAudio({
      base64Data: response.audio,
      outputPath: './output.wav',
      mimeType: 'audio/wav'
    })

    if (result.success) {
      console.log('デコードが完了しました')
    } else {
      console.error('デコードに失敗しました:', result.error)
    }
  } catch (error) {
    console.error('JSONファイルの読み込みに失敗しました:', error)
    process.exit(1)
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  main().catch(console.error)
}

export { decodeAudio } 