// StockNotes.js - A component to manage notes for a specific stock
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import {analysisAPI } from '../../services/apiService';

const StockNotes = ({ symbol, stockName }) => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch existing notes for this stock
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        // Use the new API endpoint to fetch notes by stock symbol
        const response = await analysisAPI.getStockNotes(symbol);
        setNotes(response.data);
      } catch (error) {
        console.error('Error fetching notes:', error);
        showSnackbar('Failed to load notes', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchNotes();
    }
  }, [symbol]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSaveNote = async () => {
    if (!currentNote.trim()) return;

    try {
      setLoading(true);
      
      const noteData = {
        symbol,
        name: stockName,
        recommendation: 'HOLD', // Default value, could be dynamically set
        notes: currentNote
      };

      if (editingNoteId) {
        // Use the new update note endpoint
        const response = await analysisAPI.updateNote(editingNoteId, { notes: currentNote });
        
        // Replace the edited note in the local state
        setNotes(notes.map(note => 
          note.id === editingNoteId ? response.data.analysis : note
        ));
        
        showSnackbar('Note updated successfully');
        setEditingNoteId(null);
      } else {
        // Create a new note
        const response = await analysisAPI.saveAnalysis(noteData);
        
        // Add the new note to the local state
        setNotes([response.data.analysis, ...notes]);
        
        showSnackbar('Note saved successfully');
      }
      
      // Clear the input
      setCurrentNote('');
    } catch (error) {
      console.error('Error saving note:', error);
      showSnackbar('Failed to save note', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (note) => {
    setCurrentNote(note.notes);
    setEditingNoteId(note.id);
  };

  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;

    try {
      setLoading(true);
      await analysisAPI.deleteSavedAnalysis(noteToDelete.id);
      
      // Remove from local state
      setNotes(notes.filter(note => note.id !== noteToDelete.id));
      
      showSnackbar('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      showSnackbar('Failed to delete note', 'error');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setCurrentNote('');
    setEditingNoteId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {editingNoteId ? 'Edit Note' : 'Add Note'}
        </Typography>
        {editingNoteId && (
          <Button 
            variant="outlined" 
            color="secondary" 
            size="small"
            onClick={handleCancelEdit}
          >
            Cancel Edit
          </Button>
        )}
      </Box>

      <TextField
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        placeholder="Add your personal notes about this stock..."
        value={currentNote}
        onChange={(e) => setCurrentNote(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button 
        variant="contained" 
        color="primary"
        startIcon={<SaveIcon />}
        onClick={handleSaveNote}
        disabled={loading || !currentNote.trim()}
      >
        {editingNoteId ? 'Update Note' : 'Save Note'}
      </Button>

      {notes.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Your Notes History
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {notes.map((note) => (
              <Paper key={note.id} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {new Date(note.timestamp).toLocaleString()}
                  </Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleEditNote(note)}
                      title="Edit note"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteClick(note)}
                      title="Delete note"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body1">
                  {note.notes}
                </Typography>
              </Paper>
            ))}
          </List>
        </Box>
      )}

      {/* Confirmation Dialog for Deleting */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this note? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StockNotes;