const mongoose = require('mongoose')
const axios = require('axios')
const Testimonials = mongoose.model("Testimonials");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)

module.exports ={
        
    post: async (req, res)=> {
        try{
            const data = {
                name: DOMPurify.sanitize(req.body.name),
                body: DOMPurify.sanitize(req.body.body),
            }

            // get a random avatar

            if(!data.name || !data.body){
                return res.status(400).json({ status: false, msg: "All fields are required"})
            }

            // save to the database
            const newData = new Testimonials({
                name: data.name,
                body: data.body,
            })

            await newData.save();

            return res.status(200).json({ status: true, msg: "Thank you for the feedback"})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

    get: async (req, res)=> {
        try{
            const {id} = req.params;

            const data = await Testimonials.findOne({_id: id});
            return res.status(200).json({ status: true, msg: "suucessful", data})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getAll: async (req, res)=> {
        try{
            const data = await Testimonials.find({});
            return res.status(200).json({ status: true, msg: "suucessful", data})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getSelected: async (req, res)=> {
        try{
               const data = await Testimonials.find({}).sort({createdAt: -1});
               
               let selectedData = []
               //loop through data and only push the ones not having remove status as false
               for(let d of data){
                    if(!d.removed){
                        selectedData.push(d)
                    }else{
                        selectedData = []
                    }
               }

               return res.status(200).json({ status: true, msg: "suucessful", data: selectedData})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    restrict: async (req, res)=> {
        try{
            const {id} = req.params;

            // find the collection with this id and update the remove status to be false
            const data = await Testimonials.findByIdAndUpdate({_id: id}, {$set: {
                removed: false
            }}, {new: true});

            return res.status(200).json({ status: true, msg: "suucessful", data})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    delete: async (req, res)=> {
        try{
            // find the collection with this id and update the remove status to be false
            const data = await Testimonials.findByIdAndRemove({_id: id});
            
            return res.status(200).json({ status: true, msg: "suucessful", data})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    deleteAll: async (req, res)=> {
        try{
               const data = await Testimonials.deleteAll({})
               return res.status(200).json({ status: true, msg: "suucessful", data})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

}