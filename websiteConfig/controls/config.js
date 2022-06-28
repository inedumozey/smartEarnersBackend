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
                return res.status(200).json({ status: true, msg: "Config updated", data: configs})
            }

            // otherwise, get the existing ones
            return res.status(200).json({ status: true, msg: "Config updated", data: config})
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
                return res.status(200).json({ status: true, msg: "Config updated", data: configs})
            }

            // otherwise, get the existing ones
            return res.status(200).json({ status: true, msg: "Config updated", data: config})

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
                conversionRate:  DOMPurify.sanitize(req.body.conversionRate),
                nativeCurrency:  DOMPurify.sanitize(req.body.nativeCurrency),
                tradeCurrency:  DOMPurify.sanitize(req.body.tradeCurrency),
                brandColorA:  DOMPurify.sanitize(req.body.brandColorA),
                brandColorB:  DOMPurify.sanitize(req.body.brandColorB),
                brandColorC:  DOMPurify.sanitize(req.body.brandColorC),
                verifyEmail:  DOMPurify.sanitize(req.body.verifyEmail),
                stands:  DOMPurify.sanitize(req.body.stands),
                investmentLimits:  parseInt(DOMPurify.sanitize(req.body.investmentLimits)),
            }

            const resolveCustomerSupport =()=>{
                return data.customerSupport === 'yes' ? 'yes' : 'no'
            };
            const resolveVerifyEmail =()=>{
                return data.verifyEmail === 'yes' ? 'yes' : 'no'
            }

            const modifiedData = {
                name: data.name,
                bio: data.bio,
                whatWeDo: data.whatWeDo,
                customerSupport: resolveCustomerSupport(),
                unverifyUserLifeSpan: parseInt(data.unverifyUserLifeSpan),
                conversionRate: parseInt(data.conversionRate),
                nativeCurrency: data.nativeCurrency.toUpperCase(),
                tradeCurrency: data.tradeCurrency.toUpperCase(),
                brandColorA: data.brandColorA,
                brandColorB: data.brandColorB,
                brandColorC: data.brandColorC,
                stands: data.stands,
                investmentCount: data.investmentCount,
                verifyEmail: resolveVerifyEmail(),
            }

            // get all config
            const config = await Config.find({});

            // check if document  is empty
            if(config.length < 1){
                
                // initiate config with the updating data
                const newConfig = new Config( modifiedData )
                const configs = await newConfig.save();
                
                return res.status(200).json({ status: true, msg: "Config updated", data: configs})
            }

            //get the first and only id
            const id = config[0].id

            //update config
            const configs = await Config.findByIdAndUpdate({_id: id}, {$set: modifiedData }, {new: true});

            return res.status(200).json({ status: true, msg: "Config updated", data: configs})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    updateContact: async (req, res)=> {
        try{
            const contacts = JSON.parse(DOMPurify.sanitize(JSON.stringify(req.body.contacts)));
            
            // get all config
            const config = await Config.find({});

            if(config.length < 1){
                //add contact
                const newConfig = new Config({contacts: [...contacts]});
                newConfig.save()

                return res.status(200).json({ status: true, msg: "contacts updated", data: newConfig})

            }

            // loop through contacts from form, and push to contacts in config database without duplicate 
            await Config.findByIdAndUpdate({_id: config[0].id}, {$set: {contacts: contacts}}, {new: true})

            const config_ = await Config.find({});
            return res.status(200).json({ status: true, msg: "contacts updated", data: config_})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    updateBenefits: async (req, res)=> {
        try{
            const benefits = JSON.parse(DOMPurify.sanitize(JSON.stringify(req.body.benefits)));
            
            // get all config
            const config = await Config.find({});

            if(config.length < 1){
                //add contact
                const newConfig = new Config({benefits: [...benefits]});
                newConfig.save()

                return res.status(200).json({ status: true, msg: "benefits updated", data: newConfig})

            }

            // loop through benefits from form, and push to benefits in config database without duplicate 
            await Config.findByIdAndUpdate({_id: config[0].id}, {$set: {benefits: benefits}}, {new: true})

            const config_ = await Config.find({});
            return res.status(200).json({ status: true, msg: "benefits updated", data: config_})
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