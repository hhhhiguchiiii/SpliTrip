import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTrip, updateTrip } from '../api/tripApi'
import type { Trip } from '../../shared/types/trip'
import UsageGuideModal from '../components/UsageGuideModal'

/**
 * 旅行ページコンポーネント
 * 要件: 1.4, 7.3
 * 
 * 機能:
 * - 旅行名表示
 * - メニューナビゲーション（レシート入力、レシート修正、精算確認）
 * - メモ機能（旅行のしおり）
 */
function TripPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [isEditingMemo, setIsEditingMemo] = useState(false)
  const [memoValue, setMemoValue] = useState('')
  const [isSavingMemo, setIsSavingMemo] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 旅行データを取得
  useEffect(() => {
    if (!tripId) {
      setError('旅行IDが指定されていません')
      setIsLoading(false)
      return
    }

    const fetchTrip = async () => {
      try {
        const tripData = await getTrip(tripId)
        setTrip(tripData)
        setMemoValue(tripData.memo ?? '')
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'サーバーエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrip()
  }, [tripId])

  // メモ編集開始
  const handleMemoEdit = () => {
    setIsEditingMemo(true)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  // メモ保存
  const handleMemoSave = async () => {
    if (!trip || !tripId) return
    setIsSavingMemo(true)
    try {
      const updated = await updateTrip({ ...trip, memo: memoValue })
      setTrip(updated)
      setIsEditingMemo(false)
    } catch (err) {
      // 保存失敗時はそのまま編集モードを維持
    } finally {
      setIsSavingMemo(false)
    }
  }

  // メモ編集キャンセル
  const handleMemoCancel = () => {
    setMemoValue(trip?.memo ?? '')
    setIsEditingMemo(false)
  }

  // ローディング中
  if (isLoading) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <p>読み込み中...</p>
      </div>
    )
  }

  // エラー表示
  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      </div>
    )
  }

  // 旅行が見つからない
  if (!trip) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <p>旅行が見つかりません</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* 旅行名表示 */}
      <h1>{trip.tripName}</h1>
      
      {/* 旅行情報 */}
      <div style={{
        padding: '15px',
        marginBottom: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px'
      }}>
        <p style={{ margin: '5px 0' }}>
          <strong>メンバー数:</strong> {trip.members.length}人
        </p>
        <p style={{ margin: '5px 0' }}>
          <strong>レシート数:</strong> {trip.receipts.length}件
        </p>
      </div>

      {/* メモ欄 */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <strong>📝 旅行メモ</strong>
          {!isEditingMemo && (
            <button
              onClick={handleMemoEdit}
              style={{
                padding: '2px 10px',
                fontSize: '13px',
                cursor: 'pointer',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#fff'
              }}
            >
              編集
            </button>
          )}
        </div>
        {isEditingMemo ? (
          <div>
            <textarea
              ref={textareaRef}
              value={memoValue}
              onChange={e => setMemoValue(e.target.value)}
              rows={6}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '15px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              placeholder="旅行のしおりとして自由にメモを残せます"
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={handleMemoSave}
                disabled={isSavingMemo}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSavingMemo ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {isSavingMemo ? '保存中...' : '保存'}
              </button>
              <button
                onClick={handleMemoCancel}
                disabled={isSavingMemo}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#9E9E9E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={handleMemoEdit}
            style={{
              padding: '10px',
              minHeight: '60px',
              backgroundColor: '#fffde7',
              borderRadius: '4px',
              border: '1px solid #f0e68c',
              whiteSpace: 'pre-wrap',
              cursor: 'pointer',
              color: memoValue ? '#333' : '#aaa',
              fontSize: '15px'
            }}
          >
            {memoValue || 'タップしてメモを追加...'}
          </div>
        )}
      </div>

      {/* メニューナビゲーション */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* レシート入力 */}
        <Link
          to={`/trip/${tripId}/receipt/new`}
          style={{
            display: 'block',
            padding: '20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          レシート入力
        </Link>

        {/* レシート修正 */}
        <Link
          to={`/trip/${tripId}/receipts`}
          style={{
            display: 'block',
            padding: '20px',
            backgroundColor: '#FF9800',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          レシート修正
        </Link>

        {/* 精算確認 */}
        <Link
          to={`/trip/${tripId}/summary`}
          style={{
            display: 'block',
            padding: '20px',
            backgroundColor: '#2196F3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          精算確認
        </Link>

        {/* サブグループ登録 */}
        <Link
          to={`/trip/${tripId}/subgroups`}
          style={{
            display: 'block',
            padding: '20px',
            backgroundColor: '#9C27B0',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          サブグループ登録
        </Link>

        {/* 使い方ボタン */}
        <button
          onClick={() => setIsGuideOpen(true)}
          style={{
            display: 'block',
            width: '100%',
            padding: '20px',
            backgroundColor: '#607D8B',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          使い方
        </button>
      </div>

      {/* 使い方ガイドモーダル */}
      <UsageGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  )
}

export default TripPage
