const mongoose=require("mongoose");
const schema = mongoose.Schema;

const paybackSchema=new schema({
    quantity:{
        type:Number,
        required:true,
    },
     wasteType:{
        type:String,
        required:true,
    },
     bankname:{
        type:String,
        required:true,
    },
     branch:{
        type:String,
        required:true,
    },
     branchCode:{
        type:String,
        required:true,
    },
     accountNumber:{
        type:String,
        required:true,
    }

   

});

 module.exports=mongoose.model(
        "paybackM",
        paybackSchema

    )