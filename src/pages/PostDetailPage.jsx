import css from './postdetailpage.module.css'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPostDetail, deletePost } from '../apis/postApi'
import { formatDate } from '../utils/features'
import { useSelector } from 'react-redux'
import { Comments } from '../components/Comments'
//
import LikeButton from '../components/LikeButton'

export const PostDetailPage = () => {
  const username = useSelector(state => state.user.user.username)
  const { postId } = useParams()
  const [postInfo, setPostInfo] = useState({})
  // 댓글 수 상태관리
  const [commentCount, setCommentCount] = useState(0)

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const data = await getPostDetail(postId)
        console.log(data)
        setPostInfo(data)
        // 초기 댓글 수 설정 (백엔드에서 전달받은 경우)
        setCommentCount(data.commentCount || 0)
      } catch (error) {
        console.error('상세정보 조회 실패:', error)
      }
    }
    fetchPostDetail()
  }, [postId])

  // 댓글 수를 업데이트하는 함수
  const updateCommentCount = count => {
    setCommentCount(count)
  }

  const handleDeletePost = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deletePost(postId)
        alert('삭제되었습니다.')
        window.location.href = '/'
      } catch (error) {
        console.error('글 삭제 실패:', error)
        alert('삭제에 실패했습니다.')
      }
    }
  }

  return (
    <main className={css.postdetailpage}>
      <h2>블로그 상세 페이지</h2>
      <section>
        <div className={css.detailimg}>
          <img src={`${import.meta.env.VITE_BACK_URL}/${postInfo?.cover}`} alt="" />
          <h3>{postInfo?.title}</h3>
        </div>
        <div className={css.info}>
          <p className={css.author}>
            <Link to={`/userpage/${postInfo?.author}`}>{postInfo?.author}</Link>
          </p>
          <p className={css.date}>{formatDate(postInfo?.updatedAt)}</p>
          <p>
            {postInfo && <LikeButton postId={postId} likes={postInfo.likes} />}{' '}
            <span style={{ marginLeft: '10px' }}>💬 {commentCount}</span>
          </p>
        </div>
        <div className={css.summary}>{postInfo?.summary}</div>
        {/* Quill 에디터로 작성된 HTML 콘텐츠를 렌더링 */}
        <div
          className={`${css.content} ql-content`}
          dangerouslySetInnerHTML={{ __html: postInfo?.content }}
        ></div>
      </section>

      <section className={css.btns}>
        {/* 로그인한 사용자만 글을 수정, 삭제할 수 있습니다. */}
        {username === postInfo?.author && (
          <>
            <Link to={`/edit/${postId}`}>수정</Link>
            <span onClick={handleDeletePost}>삭제</span>
          </>
        )}
        <Link to="/">목록으로</Link>
      </section>

      {/* 업데이트된 Comments 컴포넌트에 commentCount와 updateCommentCount 함수 전달 */}
      <Comments
        postId={postId}
        commentCount={commentCount}
        onCommentCountChange={updateCommentCount}
      />
    </main>
  )
}
