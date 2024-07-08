'use client'
import React from "react";
import Navbar from "./Navbar";
import Content1 from "./Content1";
import Content2 from "./Content2";
import ContactUs from "./ContactUs";

const page:React.FC = ()=>{

    return(
        <div>
            <Navbar/>
            <Content1/>
            <Content2/>
            <ContactUs/>
        </div>
    )

}

export default page