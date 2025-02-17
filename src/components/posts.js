import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography, Link, CircularProgress, Button, Box } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../App.css'

const RedditPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const contentRefs = useRef([]);

  useEffect(() => {
    fetch('https://www.reddit.com/r/reactjs.json')
      .then((response) => response.json())
      .then((data) => {
        const postsData = data.data.children.map((post) => ({
          title: post.data.title,
          selftext: post.data.selftext,
          url: post.data.url,
          score: post.data.score,
          expanded: false,
          showReadMore: false, // Initialize showReadMore here
        }));
        setPosts(postsData);
        setLoading(false);
        contentRefs.current = Array(postsData.length).fill(null);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (contentRefs.current) {
      contentRefs.current.forEach((ref, index) => {
        if (ref) {
          setPosts(prevPosts => {
            const updatedPosts = [...prevPosts];
            updatedPosts[index] = { ...updatedPosts[index], showReadMore: ref.scrollHeight > 200 }; // Correct way to update nested state
            return updatedPosts;
          });
        }
      });
    }
  }, [posts]); 

  const renderContent = (post, index) => (
    <div
      ref={(el) => (contentRefs.current[index] = el)}
      style={{
        maxHeight: post.expanded ? 'none' : '200px',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.selftext}</ReactMarkdown>
    </div>
  );

  const handleReadMore = (index) => {
    setPosts(prevPosts => {
      const updatedPosts = [...prevPosts];
      updatedPosts[index] = { ...updatedPosts[index], expanded: !updatedPosts[index].expanded }; // Correct way to update nested state
      return updatedPosts;
    });
  };


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', bgcolor: '#f0f0f0', padding: 4 }}> {/* Use Box for layout and styling */}
    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
        ReactJS Reddit Posts
    </Typography>

    {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: '#555', marginBottom: 2 }}>Loading...</Typography>
            <CircularProgress />
        </Box>
    ) : (
        <Box sx={{ width: '80%', maxWidth: '900px' }}> 
            {posts.map((post, index) => (
                <Card key={index} sx={{ marginBottom: 2, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
                    <CardContent sx={{ padding: 3 }}>
                        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '500', color: '#222' }}>
                            {post.title}
                        </Typography>

                        <div className="selftext">
                            {renderContent(post, index)}
                        </div>

                        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}> 
                            {post.showReadMore && !post.expanded && (
                                <Button onClick={() => handleReadMore(index)} variant="contained" color="primary" sx={{ marginRight: 2 }}>
                                    Read More
                                </Button>
                            )}

                            {post.expanded && (
                                <Button onClick={() => handleReadMore(index)} variant="contained" color="secondary" sx={{ marginRight: 2 }}>
                                    Read Less
                                </Button>
                            )}

                            <Typography variant="body2" color="text.secondary" sx={{ marginLeft: 2 }}>
                                Score: {post.score}
                            </Typography>
                        </Box>

                        <Link href={post.url} target="_blank" rel="noopener noreferrer" sx={{ display: 'block', marginTop: 2, color: '#1976d2' }}>
                            Go to post
                        </Link>
                    </CardContent>
                </Card>
            ))}
        </Box>
    )}
</Box>
);
};

export default RedditPosts;
