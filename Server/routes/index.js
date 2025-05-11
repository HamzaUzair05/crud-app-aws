var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var auth = require('../middleware/auth');
require('dotenv').config();

var my_database = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'hamab034',
  database: process.env.DB_NAME || 'users'
});

my_database.connect(function(err){
     if (err) {
       console.error("Database connection error:", err);
     } else {
       console.log("Connected to database!");
     }
});

// Root route
router.get('/', function(req, res) {
    console.log('GET / route hit');
    res.json({ message: "Welcome to the Contacts API" });
});

// Get all contacts (public route for testing)
router.get('/contacts', function(req, res) {
    console.log('GET /contacts route hit');
    try {
        my_database.query('SELECT * from contacts;', function(err, result) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            console.log('Contacts query result:', result);
            res.json(result || []);
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// Get user-specific contacts
router.get('/user-contacts', auth, function(req, res) {
    console.log('GET /user-contacts route hit for user:', req.user.id);
    try {
        my_database.query('SELECT * from contacts WHERE user_id = ?;', [req.user.id], function(err, result) {            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            console.log('User contacts query result:', result);
            res.json(result || []);
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// Get a single contact
router.get('/contacts/:id', auth, function(req, res) {
    console.log('GET /contacts/:id route hit for contact:', req.params.id);
    try {
        my_database.query('SELECT * from contacts WHERE id = ? AND user_id = ?;', 
            [req.params.id, req.user.id], 
            function(err, result) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                if (result.length === 0) {
                    return res.status(404).json({ msg: 'Contact not found' });
                }
                
                console.log('Contact query result:', result[0]);
                res.json(result[0]);
            }
        );
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// Create a new contact
router.post('/contacts', auth, function(req, res) {
    console.log('POST /contacts route hit:', req.body);
    
    try {
        const { ime, prezime, email, telefon, adresa, linkedin, skype, instagram, datumRodjenja, jmbg } = req.body;
        
        const query = `
            INSERT INTO contacts 
            (user_id, ime, prezime, email, telefon, adresa, linkedin, skype, instagram, datumRodjenja, jmbg) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        my_database.query(
            query, 
            [req.user.id, ime, prezime, email, telefon, adresa, linkedin, skype, instagram, datumRodjenja, jmbg],
            function(err, result) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                console.log('Insert result:', result);
                res.json({
                    id: result.insertId,
                    user_id: req.user.id,
                    ime, 
                    prezime, 
                    email, 
                    telefon, 
                    adresa, 
                    linkedin, 
                    skype, 
                    instagram, 
                    datumRodjenja, 
                    jmbg
                });
            }
        );
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// Update a contact
router.put('/contacts/:id', auth, function(req, res) {
    console.log('PUT /contacts/:id route hit for contact:', req.params.id);
    
    try {
        // First check if the contact exists and belongs to the user
        my_database.query(
            'SELECT * FROM contacts WHERE id = ? AND user_id = ?', 
            [req.params.id, req.user.id],
            function(err, result) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                if (result.length === 0) {
                    return res.status(404).json({ msg: 'Contact not found or not authorized' });
                }
                
                // Contact exists and belongs to user, proceed with update
                const { ime, prezime, email, telefon, adresa, linkedin, skype, instagram, datumRodjenja, jmbg } = req.body;
                
                const query = `
                    UPDATE contacts 
                    SET ime = ?, prezime = ?, email = ?, telefon = ?, adresa = ?, 
                        linkedin = ?, skype = ?, instagram = ?, datumRodjenja = ?, jmbg = ?
                    WHERE id = ? AND user_id = ?
                `;
                
                my_database.query(
                    query, 
                    [ime, prezime, email, telefon, adresa, linkedin, skype, instagram, datumRodjenja, jmbg, req.params.id, req.user.id],
                    function(err, updateResult) {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ error: 'Database error' });
                        }
                        
                        console.log('Update result:', updateResult);
                        
                        if (updateResult.affectedRows === 0) {
                            return res.status(404).json({ msg: 'Contact update failed' });
                        }
                        
                        res.json({
                            id: req.params.id,
                            user_id: req.user.id,
                            ime, 
                            prezime, 
                            email, 
                            telefon, 
                            adresa, 
                            linkedin, 
                            skype, 
                            instagram, 
                            datumRodjenja, 
                            jmbg,
                            message: 'Contact updated successfully'
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// Delete a contact
router.delete('/contacts/:id', auth, function(req, res) {
    console.log('DELETE /contacts/:id route hit for contact:', req.params.id);
    
    try {
        // First check if the contact exists and belongs to the user
        my_database.query(
            'SELECT * FROM contacts WHERE id = ? AND user_id = ?', 
            [req.params.id, req.user.id],
            function(err, result) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                if (result.length === 0) {
                    return res.status(404).json({ msg: 'Contact not found or not authorized' });
                }
                
                // Contact exists and belongs to user, proceed with delete
                my_database.query(
                    'DELETE FROM contacts WHERE id = ? AND user_id = ?', 
                    [req.params.id, req.user.id],
                    function(err, deleteResult) {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ error: 'Database error' });
                        }
                        
                        console.log('Delete result:', deleteResult);
                        
                        if (deleteResult.affectedRows === 0) {
                            return res.status(404).json({ msg: 'Contact deletion failed' });
                        }
                        
                        res.json({ msg: 'Contact deleted successfully' });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// Health check endpoint
router.get('/api/health-check', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running', 
    timestamp: new Date().toISOString()
  });
});

// Export the router
module.exports = router;