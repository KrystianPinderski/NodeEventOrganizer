const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {
        type: 'String',
        required: true,
        trim: true,
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    organizer: {
        type: 'String',
        required: true,
        trim: true,
    },
    city: {
        type: 'String',
        required: true,
        trim: true
    },
    street:{
        type:'String',
        required:true,
        trim:true
    },
    lon:{
        type:'String',
        required: true,
    },
    lat:{
        type:'String',
        required: true,
    },
    description: {
        type: 'String',
        required: true,
        trim: true
    },
    tags: [{
        type: 'String',
        required: false
    }],
    link:{
        type:'String',
        required:false
    }
});
module.exports = mongoose.model('Events', eventSchema);