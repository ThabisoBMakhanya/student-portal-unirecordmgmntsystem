import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Rating,
  Alert,
} from '@mui/material';
import {
  Add,
  Visibility,
  AttachFile,
  Send,
  Close,
  Person,
  Support,
  CheckCircle,
  Schedule,
  Warning,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

import { SupportTicket } from '@/services/supportService';

const SupportTickets: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'general',
    subCategory: '',
    priority: 'medium',
    building: '',
    roomNumber: '',
    attachments: [] as File[],
  });
  // Real tickets data
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        // You may want to pass filters here
        const result = await import('@/services/supportService').then(m => m.supportService.getTickets());
        setTickets(result.tickets);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch support tickets');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);
      tags: ['transcript', 'official-documents'],
      createdAt: '2024-01-16T09:00:00Z',
      updatedAt: '2024-01-16T09:00:00Z',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      case 'escalated':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Schedule sx={{ color: 'info.main' }} />;
      case 'in_progress':
        return <Schedule sx={{ color: 'warning.main' }} />;
      case 'resolved':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'closed':
        return <CheckCircle sx={{ color: 'text.secondary' }} />;
      case 'escalated':
        return <Warning sx={{ color: 'error.main' }} />;
      default:
        return <Schedule sx={{ color: 'text.secondary' }} />;
    }
  };

  const getFilteredTickets = () => {
    return tickets.filter(ticket => {
      if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
      if (filterCategory !== 'all' && ticket.category !== filterCategory) return false;
      return true;
    });
  };

  const generateTicketNumber = () => {
    const year = new Date().getFullYear();
    const seq = Math.floor(Math.random() * 9000) + 1000;
    const categoryPrefix = newTicket.category === 'it' ? 'IT' :
      newTicket.category === 'facilities' ? 'FAC' :
      newTicket.category === 'academic' ? 'ACA' :
      newTicket.category === 'administrative' ? 'ADM' :
      newTicket.category === 'safety' ? 'SEC' : 'GEN';
    return `#${categoryPrefix}-${year}-${seq}`;
  };

  const handleCreateTicket = () => {
    const newTicketNumber = generateTicketNumber();
    setTicketNumber(newTicketNumber);
    setCreateDialogOpen(false);
    setSuccessDialogOpen(true);
    setNewTicket({
      title: '',
      description: '',
      category: 'general',
      subCategory: '',
      priority: 'medium',
      building: '',
      roomNumber: '',
      attachments: [],
    });
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setViewDialogOpen(true);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    console.log('Sending message...', {
      ticketId: selectedTicket._id,
      message: newMessage,
      attachments: messageAttachments,
    });
    
    setNewMessage('');
    setMessageAttachments([]);
  };

  const handleCloseTicket = () => {
    if (!selectedTicket) return;
    console.log('Closing ticket...', selectedTicket._id);
    setViewDialogOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, isMessage = false) => {
    const files = Array.from(event.target.files || []);
    if (isMessage) {
      setMessageAttachments(prev => [...prev, ...files]);
    } else {
      setNewTicket(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
    }
  };

  const filteredTickets = getFilteredTickets();

  if (loading) {
    return <Box p={3}><Alert severity="info">Loading support tickets...</Alert></Box>;
  }
  if (error) {
    return <Box p={3}><Alert severity="error">{error}</Alert></Box>;
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Support Tickets
        </Typography>
        
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              label="Category"
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="academic">Academic</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="financial">Financial</MenuItem>
              <MenuItem value="administrative">Administrative</MenuItem>
              <MenuItem value="general">General</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            New Ticket
          </Button>
        </Box>
      </Box>

      {/* Tickets Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ticket Details</TableCell>
                  <TableCell align="center">Category</TableCell>
                  <TableCell align="center">Priority</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Assigned To</TableCell>
                  <TableCell align="center">Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {ticket.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          #{ticket._id} • {ticket.messages.length} message(s)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={ticket.category}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={ticket.priority}
                        size="small"
                        color={getPriorityColor(ticket.priority) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                        {getStatusIcon(ticket.status)}
                        <Chip
                          label={ticket.status.replace('_', ' ')}
                          size="small"
                          color={getStatusColor(ticket.status) as any}
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {ticket.assignedTo ? (
                        <Box textAlign="center">
                          <Typography variant="caption" fontWeight="bold">
                            {ticket.assignedTo.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {ticket.assignedTo.department}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption">
                        {format(parseISO(ticket.createdAt), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewTicket(ticket)}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Support Ticket</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={newTicket.title}
                onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of your issue"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newTicket.category}
                  label="Category"
                  onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                >
                  <MenuItem value="facilities">Facilities (AC, lights, plumbing, furniture)</MenuItem>
                  <MenuItem value="it">IT (WiFi, printer, computer, projector)</MenuItem>
                  <MenuItem value="academic">Academic (lecturer issue, timetable conflict)</MenuItem>
                  <MenuItem value="administrative">Administrative (registration, fee dispute)</MenuItem>
                  <MenuItem value="safety">Safety & Security</MenuItem>
                  <MenuItem value="general">General</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Issue Type</InputLabel>
                <Select
                  value={newTicket.subCategory}
                  label="Issue Type"
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subCategory: e.target.value }))}
                  disabled={!newTicket.category || newTicket.category === 'general'}
                >
                  {newTicket.category === 'facilities' && (
                    <>
                      <MenuItem value="ac">Air Conditioning</MenuItem>
                      <MenuItem value="lights">Lighting</MenuItem>
                      <MenuItem value="plumbing">Plumbing</MenuItem>
                      <MenuItem value="furniture">Furniture</MenuItem>
                      <MenuItem value="cleaning">Cleaning / Sanitation</MenuItem>
                      <MenuItem value="other_facility">Other Facility Issue</MenuItem>
                    </>
                  )}
                  {newTicket.category === 'it' && (
                    <>
                      <MenuItem value="wifi">WiFi / Internet</MenuItem>
                      <MenuItem value="printer">Printer</MenuItem>
                      <MenuItem value="computer">Computer / Lab Equipment</MenuItem>
                      <MenuItem value="projector">Projector / AV Equipment</MenuItem>
                      <MenuItem value="software">Software / System Access</MenuItem>
                      <MenuItem value="other_it">Other IT Issue</MenuItem>
                    </>
                  )}
                  {newTicket.category === 'academic' && (
                    <>
                      <MenuItem value="lecturer">Lecturer Issue</MenuItem>
                      <MenuItem value="timetable">Timetable Conflict</MenuItem>
                      <MenuItem value="curriculum">Curriculum / Course Content</MenuItem>
                      <MenuItem value="assessment">Assessment / Grade Issue</MenuItem>
                      <MenuItem value="other_academic">Other Academic Issue</MenuItem>
                    </>
                  )}
                  {newTicket.category === 'administrative' && (
                    <>
                      <MenuItem value="registration">Registration</MenuItem>
                      <MenuItem value="fee_dispute">Fee Dispute</MenuItem>
                      <MenuItem value="documents">Documents / Transcripts</MenuItem>
                      <MenuItem value="graduation">Graduation / Clearance</MenuItem>
                      <MenuItem value="other_admin">Other Administrative Issue</MenuItem>
                    </>
                  )}
                  {newTicket.category === 'safety' && (
                    <>
                      <MenuItem value="theft">Theft / Suspicious Activity</MenuItem>
                      <MenuItem value="harassment">Harassment / Bullying</MenuItem>
                      <MenuItem value="emergency">Emergency / Medical</MenuItem>
                      <MenuItem value="lighting_safety">Poor Lighting / Dark Areas</MenuItem>
                      <MenuItem value="other_safety">Other Safety Concern</MenuItem>
                    </>
                  )}
                  {newTicket.category === 'general' && (
                    <MenuItem value="general">General Inquiry</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTicket.priority}
                  label="Priority"
                  onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Building</InputLabel>
                <Select
                  value={newTicket.building}
                  label="Building"
                  onChange={(e) => setNewTicket(prev => ({ ...prev, building: e.target.value }))}
                >
                  <MenuItem value="">Select building</MenuItem>
                  <MenuItem value="Main Academic Block">Main Academic Block</MenuItem>
                  <MenuItem value="Science & Technology Centre">Science & Technology Centre</MenuItem>
                  <MenuItem value="Creative Arts Centre">Creative Arts Centre</MenuItem>
                  <MenuItem value="Library & Resource Centre">Library & Resource Centre</MenuItem>
                  <MenuItem value="Administration Block">Administration Block</MenuItem>
                  <MenuItem value="Student Centre">Student Centre</MenuItem>
                  <MenuItem value="Hospitality Training Centre">Hospitality Training Centre</MenuItem>
                  <MenuItem value="Sports Complex">Sports Complex</MenuItem>
                  <MenuItem value="Health & Wellness Centre">Health & Wellness Centre</MenuItem>
                  <MenuItem value="IT Building">IT Building</MenuItem>
                  <MenuItem value="Makhaya Hall">Makhaya Hall</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Room Number / Description"
                value={newTicket.roomNumber}
                onChange={(e) => setNewTicket(prev => ({ ...prev, roomNumber: e.target.value }))}
                placeholder="e.g., Room 101, Ground Floor"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline

                rows={4}
                label="Description"
                value={newTicket.description}
                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed information about your issue..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFile />}
              >
                Attach Files
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={(e) => handleFileUpload(e)}
                />
              </Button>
              {newTicket.attachments.length > 0 && (
                <Box mt={1}>
                  {newTicket.attachments.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      size="small"
                      onDelete={() => {
                        setNewTicket(prev => ({
                          ...prev,
                          attachments: prev.attachments.filter((_, i) => i !== index)
                        }));
                      }}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateTicket}
            variant="contained"
            disabled={!newTicket.title || !newTicket.description}
          >
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle color="success" />
            <Typography variant="h6">Report Submitted Successfully</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box textAlign="center" py={3}>
            <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
              {ticketNumber}
            </Typography>
            <Typography variant="body1" paragraph>
              Your issue has been received. Use this ticket number to track the status.
            </Typography>
            <Alert severity="info" sx={{ textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Next steps:</strong> Our team will review your report and update the status.
                You will receive an email notification when the status changes.
              </Typography>
            </Alert>
            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Track your ticket status from <strong>My Reports</strong> tab
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="contained" onClick={() => setSuccessDialogOpen(false)}>
            Done
          </Button>
          <Button variant="outlined" onClick={() => { setSuccessDialogOpen(false); setViewDialogOpen(false); }}>
            Track My Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Ticket Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        maxHeight="80vh"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">{selectedTicket?.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                Ticket #{selectedTicket?._id}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Chip
                label={selectedTicket?.status.replace('_', ' ')}
                color={getStatusColor(selectedTicket?.status || '') as any}
                size="small"
              />
              <Chip
                label={selectedTicket?.priority}
                color={getPriorityColor(selectedTicket?.priority || '') as any}
                size="small"
              />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box>
              {/* Ticket Info */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                  <Typography variant="body2">{selectedTicket.category}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Assigned To</Typography>
                  <Typography variant="body2">
                    {selectedTicket.assignedTo?.name || 'Unassigned'}
                  </Typography>
                </Grid>
              </Grid>

              {/* Messages */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Conversation
              </Typography>
              <List sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
                {selectedTicket.messages.map((message, index) => (
                  <React.Fragment key={message._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>
                          {message.sender.role === 'student' ? <Person /> : <Support />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" fontWeight="bold">
                              {message.sender.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(parseISO(message.timestamp), 'MMM dd, yyyy h:mm a')}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {message.message}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < selectedTicket.messages.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              {/* Add Message */}
              {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Add a message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<AttachFile />}
                      size="small"
                    >
                      Attach
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={(e) => handleFileUpload(e, true)}
                      />
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Send />}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      Send Message
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Resolution */}
              {selectedTicket.resolution && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Resolution</Typography>
                  <Typography variant="body2">{selectedTicket.resolution.summary}</Typography>
                  {selectedTicket.resolution.satisfaction && (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Typography variant="caption">Your rating:</Typography>
                      <Rating value={selectedTicket.resolution.satisfaction} readOnly size="small" />
                    </Box>
                  )}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
          {selectedTicket?.status === 'resolved' && (
            <Button
              onClick={handleCloseTicket}
              variant="contained"
              startIcon={<Close />}
            >
              Close Ticket
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportTickets;
