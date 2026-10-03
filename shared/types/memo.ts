/**
 * 旅行メモ
 * 旅行のしおりとして使える複数メモ
 */
export type TripMemo = {
  id: string       // メモID（例: memo_abc123）
  title: string    // メモタイトル（例: 宿情報、アクティビティ）
  content: string  // メモ内容（フリーテキスト）
  createdAt: string
  updatedAt: string
}
