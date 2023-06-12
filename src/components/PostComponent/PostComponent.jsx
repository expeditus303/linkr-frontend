import { useEffect, useRef, useState } from "react";
import { FaRegHeart, FaHeart, FaPencilAlt, FaTrash } from "react-icons/fa";
import { Tagify } from "react-tagify";
import { useNavigate } from "react-router-dom";
import API from "../../config/api";
import { BiRepost } from "react-icons/bi";
import {
  AuthorName,
  ImageContent,
  LinkContent,
  PostContainer,
  PostContent,
  PostText,
  tagStyle,
  ContentInput,
  EspacoIcones,
  PostHeader,
  PostOuterContainer,
  CommentContainer,
  CommentInputContainer,
  PictureLikesCommentsAndRepost,
} from "./styles";
import LinkrImage from "../../assets/linkr-image.jpg";
import { Tooltip } from "react-tooltip";
import useTokenContext from "../../contexts/TokenContext";
import useRefreshContext from "../../contexts/RefreshContext";
import { IoPaperPlaneOutline } from "react-icons/io5";
import CommentsComponent from "../CommentsComponent/CommentsComponent";
import { AiOutlineComment } from "react-icons/ai";
import ConfirmationDialog from "../ConfirmationDialog/ConfirmationDialog.jsx";
import RepostComponent from "../RepostComponent/RepostComponent.jsx";

export default function PostComponent({ postId, post, userId, username, setPosts, _posts }) {
  const { repost_id, reposter_user_id, repost_count } = post;
  let { reposter_username } = post;
  const { token } = useTokenContext();
  const { refresh, setRefresh } = useRefreshContext();
  const [repostCounter, setRepostCounter] = useState(Number(repost_count));

  const navigate = useNavigate();

  const [myPost, setMyPost] = useState(post);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);

  const [liked, setLiked] = useState(Object.hasOwn(myPost.liked_by, userId.toString()));
  const [howMany, setHowMany] = useState(Object.keys(myPost.liked_by).length);
  const [dispatchLike, setDispatchLike] = useState(false);

  const [editing, setEditing] = useState(false);
  const [newContent, setNewContent] = useState(post.content);
  const [postContent, setPostContent] = useState(post.content);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [repostConfirmation, setRepostConfirmation] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comment_count);

  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);

  const [tooltipId] = useState(`text-likes-${post.id}`);

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
    if (!editing) {
      setNewContent("");
    }
  }, [editing]);

  function submitEdit() {
    setLoading(true);
    const promise = API.editPost(token, post.id, { content: newContent });
    promise
      .then((res) => {
        setEditing(false);
        setPostContent(newContent);
      })
      .catch((err) => {
        alert("Houve um erro ao editar seu post");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const handleKeyDown = (event) => {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      submitEdit();
    }
    if (event.keyCode === 27) setEditing(false);
  };

  const handleChange = (event) => {
    setNewContent(event.target.value);
  };

  const handleImageError = (event) => {
    event.target.src = LinkrImage;
  };

  function onHashtagClick(tag) {
    setPosts(undefined);
    setRefresh(!refresh);
    return navigate(`/hashtag/${tag}`);
  }

  const likeHandler = () => {
    if (isUpdating) return;
    setIsUpdating(true);
    setMyPost((prev) => {
      if (liked) {
        const { [userId.toString()]: omittedKey, ...updatedPost } = prev;
        setHowMany(howMany - 1);
        setLiked(false);
        return updatedPost;
      } else {
        const newLiked = {
          ...prev,
          [userId.toString()]: username,
        };
        setHowMany(howMany + 1);
        setLiked(true);
        return newLiked;
      }
    });
    setDispatchLike(!dispatchLike);
  };

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }
    API.likePost(token, postId)
      .then((res) => {
        if (res.data.isLiked !== liked) {
          setLiked(!liked);
          console.log("Reverting like state due remote divergence...");
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsUpdating(false);
        console.log("IsUpdating end");
      });
    // eslint-disable-next-line
  }, [dispatchLike]);

  function submitDelete() {
    setLoading(true);
    const promise = API.deletePost(token, post.id);
    promise
      .then((res) => {
        setDeleteConfirmation(false);
        setPosts((prevPosts) => prevPosts.filter((updatedPost) => updatedPost.id !== post.id));
      })
      .catch((err) => {
        console.log(err);
        alert("Houve um erro ao deletar seu post");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function submitRepost() {
    setLoading(true);
    setRepostConfirmation(false);
    setLoading(false);
    createRepost();
  }

  const likesText = () => {
    const likeKeys = Object.keys(myPost.liked_by);

    if (howMany === 0) {
      return "Nenhum usuário curtiu esse post";
    } else if (howMany === 1) {
      if (liked) {
        return "Você curtiu esse post";
      } else {
        return `${myPost.liked_by[likeKeys[0]]}`;
      }
    } else if (howMany === 2) {
      if (liked) {
        const user = likeKeys.find((value) => value !== userId);
        return `Você e ${myPost.liked_by[likeKeys[user]]} curtiram esse post`;
      } else {
        return `${myPost.liked_by[likeKeys[0]]} e ${myPost.liked_by[likeKeys[1]]} curtiram esse post`;
      }
    } else if (howMany > 2) {
      if (liked) {
        const user = likeKeys.find((value) => value !== userId);
        const othersCount = howMany - 2;
        return `Você, ${myPost.liked_by[likeKeys[user]]} e mais ${othersCount} pessoa${
          othersCount > 1 ? "s" : ""
        } curtiram esse post`;
      } else {
        const othersCount = howMany - 2;
        return `${myPost.liked_by[likeKeys[0]]}, ${myPost.liked_by[likeKeys[1]]} e mais ${othersCount} pessoa${
          othersCount > 1 ? "s" : ""
        } curtiram esse post`;
      }
    }
  };

  async function createRepost() {
    try {
      await API.createRepost(token, post.id);
      return setRepostCounter(repostCounter + 1);
    } catch (err) {
      console.log(err);
      return alert("Oops! Repost was unsuccessful. Please try again");
    }
  }

  reposter_username = userId === reposter_user_id ? "you" : reposter_username;

  let repostString = repostCounter == 1 ? "re-post" : "re-posts";

  const renderConfirmationDialog = (confirmation, actionType, onCancel, onConfirm) =>
    confirmation ? <ConfirmationDialog actionType={actionType} onCancel={onCancel} onConfirm={onConfirm} /> : null;

  return (
    <>
      {repost_id !== null ? <RepostComponent repost_id={repost_id} reposter_username={reposter_username} /> : null}
      <PostOuterContainer>
        <PostContainer data-test="post">
          <PictureLikesCommentsAndRepost>
            <img src={post.picture} alt="" onClick={() => navigate(`/user/${post.user_id}`)} />
            <span data-test="like-btn" onClick={likeHandler}>
              {liked ? <FaHeart color="red" size="20px" /> : <FaRegHeart color="white" size="20px" />}
            </span>
            <h2
              data-test="counter"
              data-tooltip-id={tooltipId}
              data-tooltip-content={likesText()}
              data-tooltip-place="bottom"
            >
              {howMany} like{howMany > 1 || howMany === 0 ? "s" : ""}
            </h2>
            <span data-test="tooltip">
              <Tooltip id={tooltipId} style={{ backgroundColor: "#FFFFFF", color: "#505050" }} />
            </span>
            <AiOutlineComment
              data-test="comment-btn"
              color="white"
              size="20px"
              onClick={() => setCommenting(!commenting)}
            />
            <h2 data-test="comment-counter" style={{ color: "white", fontSize: "10px" }}>
              {commentsCount} comments
            </h2>
            <BiRepost data-test="repost-btn" color="white" size="20px" onClick={() => setRepostConfirmation(true)} />
            <h2 data-test="repost-counter" style={{ color: "white", fontSize: "10px" }}>
              {repostCounter} {repostString}
            </h2>
          </PictureLikesCommentsAndRepost>
          <PostContent>
            <PostHeader>
              <AuthorName data-test="username" onClick={() => navigate(`/user/${post.user_id}`)}>
                {post.username}
              </AuthorName>
              {userId === post.user_id ? (
                <div>
                  <FaPencilAlt data-test="edit-btn" color="white" size="19px" onClick={() => setEditing(!editing)} />
                  <EspacoIcones />
                  <FaTrash
                    data-test="delete-btn"
                    color="white"
                    size="19px"
                    onClick={() => setDeleteConfirmation(true)}
                  />
                </div>
              ) : null}
            </PostHeader>
            {editing ? (
              <ContentInput
                ref={inputRef}
                value={newContent}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={loading}
                data-test="edit-input"
              />
            ) : (
              <PostText data-test="description">
                <Tagify onClick={(tag) => onHashtagClick(tag)} tagStyle={tagStyle} detectMentions={false}>
                  {postContent}
                </Tagify>
              </PostText>
            )}

            <LinkContent data-test="link" href={post.url} target="_blank">
              <div>
                <h1>{post.url_title}</h1>
                <p>{post.url_description}</p>
                <h2>{post.url}</h2>
              </div>
              <ImageContent src={post.url_picture} alt="Link Image" onError={handleImageError} />
            </LinkContent>
          </PostContent>
          {renderConfirmationDialog(deleteConfirmation, 'submitDelete', () => setDeleteConfirmation(false), submitDelete)}
          {renderConfirmationDialog(repostConfirmation, 'submitRepost', () => setRepostConfirmation(false), submitRepost)}
        </PostContainer>
        {commenting ? <CommentsComponent setCommentsCount={setCommentsCount} commentsCount={commentsCount} token={token} postId={postId} postUserId={post.user_id} /> : null}
      </PostOuterContainer>
    </>
  );
}
