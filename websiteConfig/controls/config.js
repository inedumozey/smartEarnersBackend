const mongoose = require('mongoose')
const Config = mongoose.model("Config");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)


module.exports ={

    setConfig: async (req, res)=> {
        try{
            // get all config
            const config = await Config.find({});

            // check if document is empty
            if(config.length < 1){
                
                // create the default
                const newConfig = new Config({})
                const configs = await newConfig.save()
                return res.status(200).json({ status: true, msg: "Config initiated", data: configs})
            }

            // otherwise, get the existing ones
            return res.status(200).json({ status: true, msg: "Config exist already", data: config})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    getConfig: async (req, res)=> {
        try{
            // get all config
            const config = await Config.find({});

            // check if document is empty,
            if(config.length < 1){
                
                // create the default
                const newConfig = new Config({})
                const configs = await newConfig.save()
                return res.status(200).json({ status: true, msg: "Config initiated", data: configs})
            }

            // otherwise, get the existing ones
            return res.status(200).json({ status: true, msg: "Existing Config", data: config})

        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    updateConfig: async (req, res)=> {
        try{
            const data = {
                name:  DOMPurify.sanitize(req.body.name),
                bio:  DOMPurify.sanitize(req.body.bio),
                whatWeDo:  DOMPurify.sanitize(req.body.whatWeDo),
                customerSupport:  DOMPurify.sanitize(req.body.customerSupport),
                unverifyUserLifeSpan:  DOMPurify.sanitize(req.body.unverifyUserLifeSpan),
                convertionRate:  DOMPurify.sanitize(req.body.convertionRate),
                nativeCurrency:  DOMPurify.sanitize(req.body.nativeCurrency),
                tradeCurrency:  DOMPurify.sanitize(req.body.tradeCurrency),
                majorBrandColor:  DOMPurify.sanitize(req.body.majorBrandColor),
                minorBrandColor:  DOMPurify.sanitize(req.body.minorBrandColor),
            }

            const resolveCustomerSupport =()=>{
                return data.customerSupport === 'yes' ? 'yes' : 'no'
            }

            const modifiedData = {
                name: data.name,
                bio: data.bio,
                whatWeDo: data.whatWeDo,
                customerSupport: resolveCustomerSupport(),
                unverifyUserLifeSpan: parseInt(data.unverifyUserLifeSpan),
                convertionRate: parseInt(data.convertionRate),
                nativeCurrency: data.nativeCurrency.toUpperCase(),
                tradeCurrency: data.tradeCurrency.toUpperCase(),
                majorBrandColor: data.majorBrandColor,
                minorBrandColor: data.minorBrandColor,
            }


            // get all config
            const config = await Config.find({});

            // check if document  is empty
            if(config.length < 1){
                
                // initiate config with the updating data
                const newConfig = new Config( modifiedData )
                const configs = await newConfig.save();
                
                return res.status(200).json({ status: true, msg: "Config initiated", data: configs})
            }

            //get the first and only id
            const id = config[0].id

            //update config
            const configs = await Config.findByIdAndUpdate({_id: id}, {$set: modifiedData }, {new: true});

            return res.status(200).json({ status: true, msg: "Config exist already", data: configs})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

    updateContact: async (req, res)=> {
        try{
            const contact = DOMPurify.sanitize(JSON.stringify(req.body.contacts));
            console.log(contact)
                
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    updateLogo: async (req, res)=> {
        try{
           
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    removeLogo: async (req, res)=> {
        try{
           
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },
}