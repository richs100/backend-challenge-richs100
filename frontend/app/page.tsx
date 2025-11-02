'use client';

import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Paper, List, CircularProgress, Box, AppBar, Toolbar, Chip, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import { useSession, signIn, signOut } from 'next-auth/react';
import { AttachFile } from '@mui/icons-material';

interface HistoryItem {
  role: string;
  label: string;
  content: string;
}

const StyledPaper = styled(Paper)({
  padding: '1rem',
  marginTop: '1rem',
  marginBottom: '1rem',
  fontFamily: 'Open Sans, sans-serif',
});

const StyledButton = styled(Button)({
  height: '56px', // to match TextField height
});

const FixedAppBar = styled(AppBar)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1100,
});

export default function Home() {
  const { data: session, status } = useSession();
  const [question, setQuestion] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      // TODO actually upload the file here!
      const path = 'placeholder';

      setUploadedFileName(file.name);
      setUploadedFilePath(path);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    scrollToBottom();

    try {
      const body: any = { question, history };
      if (uploadedFilePath) {
        body.filepath = uploadedFilePath;
      }

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to ask question');
      }

      const data = await response.json();

      if (data.answer) {
        setHistory([...history, { label: 'user', role: 'user', content: question }, { label: 'openEvidence', role: 'system', content: data.answer }]);
        setAnswer(data.answer);
      } else {
        const errorMessage = data.error || 'An unknown error occurred.';
        setHistory([...history, { label: 'user', role: 'user', content: question }, { label: 'openEvidence', role: 'system', content: errorMessage }]);
        setAnswer(errorMessage);
      }
      setQuestion('');
    } catch (error: any) {
      console.error('Error fetching the answer:', error);
      const errorMessage = error.message || 'An unknown error occurred.';
      setHistory([...history, { label: 'user', role: 'user', content: question }, { label: 'openEvidence', role: 'system', content: errorMessage }]);
      setAnswer(errorMessage);
    }
    finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setHistory([]);
    setAnswer('');
    setQuestion('');
    setUploadedFileName(null);
    setUploadedFilePath(null);
    scrollToBottom();
  };

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [loading, history]);

  if (status === "loading") {
    return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;
  }

  if (!session) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><Button variant="contained" onClick={() => signIn()}>Login</Button></Box>;
  }

  return (
    <>
      <FixedAppBar position="static">
        <Container maxWidth="md">
          <Toolbar disableGutters>
            <Typography variant="h6" style={{ flexGrow: 1, fontFamily: 'Roboto, sans-serif' }}>
              Simple OpenEvidence
            </Typography>
            <Typography variant="body1" style={{ marginRight: '1rem' }}>{session.user?.name}</Typography>
            <Button color="inherit" onClick={() => signOut()}>Logout</Button>
            <Button color="inherit" onClick={handleNewConversation}>New Conversation</Button>
          </Toolbar>
        </Container>
      </FixedAppBar>

      <Container maxWidth="md" style={{ marginTop: '120px', fontFamily: 'Roboto, sans-serif', marginBottom: '250px' }}>
        {history.length > 0 && (
          <List>
            {history.map((item, index) => (
              <StyledPaper elevation={3} key={index}>
                <Typography variant="body1" component="div">
                  <strong>{item.label.charAt(0).toUpperCase() + item.label.slice(1)}:</strong>
                </Typography>
                <Box component="div" dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br />') }} />
              </StyledPaper>
            ))}
          </List>
        )}
        <StyledPaper elevation={3}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <TextField
              label="Ask a question"
              variant="outlined"
              fullWidth
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}  // Disable input while loading
            />
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <IconButton onClick={() => fileInputRef.current?.click()} disabled={loading}>
              <AttachFile />
            </IconButton>
            <StyledButton type="submit" variant="contained" color="primary" disabled={loading}>
              Ask
            </StyledButton>
          </form>
          {uploadedFileName && (
            <Chip
              label={uploadedFileName}
              onDelete={() => {
                setUploadedFileName(null);
                setUploadedFilePath(null);
              }}
              style={{ marginTop: '1rem' }}
            />
          )}
        </StyledPaper>
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
            <CircularProgress />
          </Box>
        )}
      </Container>
    </>
  );
}
