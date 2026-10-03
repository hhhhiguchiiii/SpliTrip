import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTrip, updateTrip } from '../api/tripApi'
import { generateMemoId } from '../../shared/utils/idGenerator'
import type { Trip } from '../../shared/types/trip'

/**
 * メモ新規作成ページ
 * - タイトルと内容を入力して保存
 * - 保存後はメモ詳細ページへ遷移
 */
function MemoInputPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'サーバーエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }
    fetchTrip()
  }, [tripId])

  if (isLoading) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <p>読み込み中...</p>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{ padding: '10px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
          {error || 'データの読み込みに失敗しました'}
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setIsSaving(true)
    try {
      const now = new Date().toISOString()
      const newMemo = {
        id: generateMemoId(),
        title: title.trim(),
        content,
        createdAt: now,
        updatedAt: now
      }
      const updatedMemos = [...trip.memos, newMemo]
      await updateTrip({ ...trip, memos: updatedMemos })
      navigate(`/trip/${tripId}/memo/${newMemo.id}`)
    } catch (err) {
      // 保存失敗時はそのまま
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* 戻るボタン */}
      <button
        onClick={() => navigate(`/trip/${tripId}`)}
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          cursor: 'pointer',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: '#fff'
        }}
      >
        ← 旅行ページへ戻る
      </button>

      <h1 style={{ fontSize: '22px', marginBottom: '24px' }}>メモを追加</h1>

      {/* タイトル入力 */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
          タイトル <span style={{ color: '#f44336' }}>*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            boxSizing: 'border-box'
          }}
          placeholder="例: 宿情報、アクティビティ、持ち物リスト"
          autoFocus
        />
      </div>

      {/* 内容入力 */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
          内容
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={10}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '15px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
            resize: 'vertical'
          }}
          placeholder="メモの内容を自由に入力してください"
        />
      </div>

      {/* ボタン */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSave}
          disabled={isSaving || !title.trim()}
          style={{
            padding: '12px 28px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSaving || !title.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {isSaving ? '保存中...' : '保存'}
        </button>
        <button
          onClick={() => navigate(`/trip/${tripId}`)}
          disabled={isSaving}
          style={{
            padding: '12px 28px',
            backgroundColor: '#9E9E9E',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}

export default MemoInputPage
