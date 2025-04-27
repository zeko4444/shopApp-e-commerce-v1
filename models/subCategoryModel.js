const mongoose=require('mongoose');

//1-create schema

const subCategoryschema= new mongoose.Schema({
    name :{
        type:String,
        trim:true,
        required:[true,'must be required'],
        unique:[true,'must be unique'],
        minlength:[2,'too short subcategory name'],
        maxlength:[32,'too long subcategory name'],
    },
    slug:{
        type :String,
        lowercase:true,
    },
    category:{
        type:mongoose.Schema.ObjectId,
        ref:'category',
        required:true,
    }
},
{timestamps:true}
)

//2-create model

const subCategoryModel=mongoose.model('subcategory',subCategoryschema);

module.exports=subCategoryModel;