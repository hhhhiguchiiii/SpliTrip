import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getTrip } from '../api/tripApi'
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
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGuideOpen, setIsGuideOpen] = useState(false)

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
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'サーバーエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrip()
  }, [tripId])

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

      {/* メモ一覧 */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <strong>📝 旅行メモ</strong>
          <button
            onClick={() => navigate(`/trip/${tripId}/memo/new`)}
            style={{
              padding: '6px 14px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            ＋ メモを追加
          </button>
        </div>
        {trip.memos.length === 0 ? (
          <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>メモはまだありません</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {trip.memos.map(memo => (
              <button
                key={memo.id}
                onClick={() => navigate(`/trip/${tripId}/memo/${memo.id}`)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#fffde7',
                  border: '1px solid #f0e68c',
                  borderRadius: '4px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 'bold'
                }}
              >
                📄 {memo.title}
              </button>
            ))}
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
