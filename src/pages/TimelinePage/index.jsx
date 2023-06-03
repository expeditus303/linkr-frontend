import { useEffect, useState } from "react";
import PostForm from "../../components/PostForm";
import {
  AppContainer,
  ContentDivider,
  TimelineContainer,
  TimelineTitle,
  TrendingHashtagsContainer,
  TrendingHashtagsTitle,
} from "./styles";
import useMyContext from "../../contexts/MyContext.jsx";
import TrendingHashtags from "../../components/TrendingHashtags/TrendingHashtags.jsx";
import API from "../../config/api";
import PostsRenderer from "../../components/PostsRenderer/PostsRenderer.jsx";

export default function TimelinePage() {
  const { token } = useMyContext();
  const { user } = useMyContext();
  const [posts, setPosts] = useState(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requestPosts = API.getPosts(token);
    requestPosts
      .then((res) => {
        setPosts(res.data);
      })
      .catch((err) => {
        console.log("An error occured while trying to fetch the posts, please refresh the page");
      });
  }, [loading]);

  return (
    <AppContainer>
      <TimelineContainer>
        <TimelineTitle>timeline</TimelineTitle>
        <PostForm userPicture={user.picture} token={token} loading={loading} setLoading={setLoading} />
        <PostsRenderer posts={posts} user={user} setPosts={setPosts} />
      </TimelineContainer>
      <TrendingHashtagsContainer data-test="trending">
        <TrendingHashtagsTitle>trending</TrendingHashtagsTitle>
        <ContentDivider></ContentDivider>
        <TrendingHashtags loading={loading} setPosts={setPosts} />
      </TrendingHashtagsContainer>
    </AppContainer>
  );
}
