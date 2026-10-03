import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTrip, updateTrip } from '../api/tripApi'
import type { Trip } from '../../shared/types/trip'

/**
 * メモ詳細ページ
 * - メモのタイトルと内容を表示
 * - 編集ボタンで編集モードに切替
 * - 削除ボタンでメモを削除
 */
function MemoDetailPage() {
  const { tripId, memoId } = useParams<{ tripId: string; memoId: string }>()
  const navigate = useNavigate()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
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

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{ padding: '10px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
          {error}
        </div>
      </div>
    )
  }

  const memo = trip?.memos.find(m => m.id === memoId)

  if (!memo) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <p>メモが見つかりません</p>
        <button onClick={() => navigate(`/trip/${tripId}`)} style={{ marginTop: '10px', cursor: 'pointer' }}>
          旅行ページへ戻る
        </button>
      </div>
    )
  }

  const handleEditStart = () => {
    setEditTitle(memo.title)
    setEditContent(memo.content)
    setIsEditing(true)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!trip || !editTitle.trim()) return
    setIsSaving(true)
    try {
      const now = new Date().toISOString()
      const updatedMemos = trip.memos.map(m =>
        m.id === memoId
          ? { ...m, title: editTitle.trim(), content: editContent, updatedAt: now }
          : m
      )
      const updated = await updateTrip({ ...trip, memos: updatedMemos })
      setTrip(updated)
      setIsEditing(false)
    } catch (err) {
      // 保存失敗時は編集モードを維持
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!trip) return
    if (!window.confirm('このメモを削除しますか？')) return
    try {
      const updatedMemos = trip.memos.filter(m => m.id !== memoId)
      await updateTrip({ ...trip, memos: updatedMemos })
      navigate(`/trip/${tripId}`)
    } catch (err) {
      // 削除失敗時はそのまま
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

      {isEditing ? (
        /* 編集モード */
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
              タイトル
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                boxSizing: 'border-box'
              }}
              placeholder="メモのタイトル"
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
              内容
            </label>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
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
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSave}
              disabled={isSaving || !editTitle.trim()}
              style={{
                padding: '10px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSaving || !editTitle.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
            <button
              onClick={handleEditCancel}
              disabled={isSaving}
              style={{
                padding: '10px 24px',
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
      ) : (
        /* 表示モード */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>{memo.title}</h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleEditStart}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  border: '1px solid #2196F3',
                  borderRadius: '4px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                編集
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  border: '1px solid #f44336',
                  borderRadius: '4px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                削除
              </button>
            </div>
          </div>
          <div
            style={{
              padding: '16px',
              backgroundColor: '#fffde7',
              borderRadius: '4px',
              border: '1px solid #f0e68c',
              whiteSpace: 'pre-wrap',
              fontSize: '15px',
              lineHeight: '1.7',
              minHeight: '120px'
            }}
          >
            {memo.content || <span style={{ color: '#aaa' }}>内容なし</span>}
          </div>
          <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
            更新: {new Date(memo.updatedAt).toLocaleString('ja-JP')}
          </p>
        </div>
      )}
    </div>
  )
}

export default MemoDetailPage
