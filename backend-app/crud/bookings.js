const testSecret = process.env.TEST_SECRETE
const stripe = require("stripe")(testSecret)
const bookingModel = require("../models/bookings")
const serviceModel = require("../models/services")
const {sendMail} = require("../utils/email")

const makeBooking = async (req,res,next) => {


    try{

        const serviceID = String(req.params.serviceID)
        const userID = String(req.user._id)

        const serviceToBook = await serviceModel.findSingleService(serviceID)//finds single or one documentin service collections
        if(serviceToBook.category === "stays" || serviceToBook.category === "activities"){

            const check_in_date = String(req.body.check_in_date)
            const check_out_date = String(req.body.check_out_date)

            //conversion of raw string received from request to date object
            const check_in_Date = new Date(check_in_date)
            const check_out_Date = new Date(check_out_date)

            //number of day difference between two dates
            const daysDiff = check_out_Date - check_in_Date

            //calculate the number of days in 24 hours between the dates,it is a conversion of milliseconds to 24 hours
            
            const quantity = Number(daysDiff / (1000 * 60 * 60 * 24))

            //checking if checkout comes after check in date
            if(check_out_Date < check_in_Date){
                return res.status(200).json({success:false,message:"Check in date cannot be before check out date"})
            }

            const serviceInBooking = await bookingModel.findOne({$and:[{serviceID},{'bookings_information.uniqueFeatures.checkOut':{$gte:check_out_date}}]})//finds one docuement in bookings collection
            

            if(serviceInBooking){
                return res.status(200).json({success:false,message:`${serviceToBook.title} is fully booked`})
            }else{
                const session = await stripe.checkout.sessions.create({
                payment_method_types:["card"],
                mode:"payment",
                metadata:{
                    userID:userID,
                    serviceID:serviceID,
                    check_in_date:check_in_date,
                    check_out_date:check_out_date,
                    client_email:req.user.email
                },
                line_items:[

                    {
                        price_data:{

                            currency:"usd",
                            product_data:{
                                name:serviceToBook.title,
                                images:[serviceToBook.imageURL]   
                            },
                            unit_amount:Math.floor(serviceToBook.price * 100)
                        },
                        quantity:quantity

                    }
                ],
                success_url:`http://localhost:5173/payment-success?payment-status=${true}`,
                cancel_url:`http://localhost:5173/payment-success?payment-status=${false}`
                })

                return res.status(200).json({success:true,session:session})

            }

        }else if (serviceToBook.category === "buses" || serviceToBook.category === "flights"){

            if(serviceToBook.uniqueFeatures.numberOfTickets > 0){

                const session = await stripe.checkout.sessions.create({

                    payment_method_types:["card"],
                    mode:"payment",
                    metadata:{
                        userID:userID,
                        serviceID:serviceID
                    },
                    line_items:[
                
                        {
                            price_data:{
    
                                currency:"usd",
                                product_data:{
                                    name:serviceToBook.title,
                                    images:[serviceToBook.imageURL]   
                                },
                            unit_amount:Math.floor(serviceToBook.price * 100)
                            },
                            quantity:1
                        }

                    ],

                    success_url:`http://localhost:5173/payment-success?payment-status=${true}`,
                    cancel_url:`http://localhost:5173/payment-success?payment-status=${false}`
                })

                return res.status(200).json({success:true,session:session})

            }else{
                return res.status(200).json({success:false,message:`${serviceToBook.title} is fully booked`})
            }
            
        }

    }catch(err){
        console.log(err.message)
    }
}

const confirmBooking = async (req,res,next) => {

    const endpointSecret = process.env.WEBHOOK_KEY
    
    let event = req.body;
    if (endpointSecret) {
        // Get the signature sent by Stripe
        const signature = req.headers['stripe-signature'];
        try {

            event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            endpointSecret
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`, err.message);
            return res.sendStatus(400);
        }

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                // Then define and call a method to handle the successful payment intent.
                // handlePaymentIntentSucceeded(paymentIntent);
                break;
            case 'payment_method.attached':
                const paymentMethod = event.data.object;
                // Then define and call a method to handle the successful attachment of a PaymentMethod.
                // handlePaymentMethodAttached(paymentMethod);
                break;
            // ... handle other event types
            case 'checkout.session.completed':
                const metadata = event.data.object.metadata
                let userID = metadata.userID
                let serviceID = metadata.serviceID
                let client_email = event.data.object.customer_details.email
                let client_name = event.data.object.customer_details.name
                let check_in_date,check_out_date;

                try{

                    const serviceToBook = await serviceModel.findSingleService(serviceID)
                    console.log(serviceToBook)
                    if(serviceToBook.category === "stays" || serviceToBook.category === "activities"){
                        check_in_date = metadata.check_in_date
                        check_out_date = metadata.check_out_date
                        const serviceInBooking = await bookingModel.findOne({$and:[{serviceID},{"bookings_information.uniqueFeatures.checkOut":{$gte:check_out_date}}]})
                        
                        if(serviceInBooking){

                        }else{

                            await bookingModel.updateOne({serviceID},{$push:{"bookings_information":{
                            userID:userID,
                            uniqueFeatures:{
                                checkIn:check_in_date,
                                checkOut:check_out_date
                            }}}

                            },{upsert:true})
                            await sendMail({
                                clientEmail:client_email,
                                subject:'Booking Confirmation',
                                message:
                                `
                                    <div>
                                    <h2><b>Booking Confirmation</b></h2>
                                    <b>dear ${client_name}</b></br>
                                    <b>Thank you for booking on <a href='http://localhost:5173'> travel.com</a></b>
                                    <b>you booking details are as follows:</b>
                                    </br>
                                    </br>
                                    <table style="border:2px solid black;border-collapse:collapse;width:100%;">

                                        <thead>
                                            <th style='border:2px solid black;border-collapse:collapse;'>Building Name</th>
                                            <th style='border:2px solid black;border-collapse:collapse;'>Country</th>
                                            <th style='border:2px solid black;border-collapse:collapse;'>City</th>
                                        </thead>

                                        <tbody>

                                            <tr>
                                                <td style='border:2px solid black;border-collapse:collapse;'>${serviceToBook.title}</td>
                                                <td style='border:2px solid black;border-collapse:collapse;'>${serviceToBook.location.country}</td>
                                                <td style='border:2px solid black;border-collapse:collapse;'>${serviceToBook.location.city}</td>
                                            </tr>

                                        </tbody>

                                    </table>

                                `
                                })

                        }

                    }else if(serviceToBook.category === "flights" || serviceToBook.category === "buses"){


                        if(serviceToBook.uniqueFeatures.numberOfTickets > 0){   

                            await serviceModel.updateOne({_id:serviceID},{$inc:{"uniqueFeatures.numberOfTickets":-1}})
                            await bookingModel.updateOne({serviceID},{$push:{"bookings_information":{userID:userID}}},{upsert:true})
                            console.log("goooooooog")
                            
                            await sendMail({

                                clientEmail:client_email,
                                subject:'Booking Confirmation',
                                message:
                                `
                                    <div>
                                        <h2><b>Booking Confirmation</b></h2>
                                        <b>dear ${client_name}</b></br>
                                        <b>Thank you for booking on <a href='http://localhost:5173'> travel.com</a></b>
                                        <b>you booking details are as follows:</b>
                                        
                                    </div>

                                    <div>

                                        <table style="border:2px solid black;border-collapse:collapse;width:100%;">

                                            <caption>Depart:</caption>

                                            <thead>
                                                <th style='border:2px solid black;border-collapse:collapse;'>Country</th>
                                                <th style='border:2px solid black;border-collapse:collapse;'>City</th>
                                                <th style='border:2px solid black;border-collapse:collapse;'>Street Name</th>
                                                <th style='border:2px solid black;border-collapse:collapse;'>Post Code</th>


                                            </thead>

                                            <tbody>

                                                <tr>
                                                    <td style='border:2px solid black;border-collapse:collapse;'>${serviceToBook.location.country}</td>
                                                    <td style='border:2px solid black;border-collapse:collapse;'>${serviceToBook.location.city}</td>
                                                    <td style='border:2px solid black;border-collapse:collapse;'>${serviceToBook.uniqueFeatures.tripFromAddress.streetName}</td>
                                                    <td style='border:2px solid black;border-collapse:collapse;'>${serviceToBook.uniqueFeatures.tripFromAddress.postCode}</td>
                                                </tr>

                                            </tbody>

                                        </table>


                                        <table style="border:2px solid black;border-collapse:collapse;width:100%;">

                                            <caption>Arrival:</caption>

                                            <thead>
                                                <th style='border:2px solid black;border-collapse:collapse;'>Country</th>
                                                <th style='border:2px solid black;border-collapse:collapse;'>City</th>
                                                <th style='border:2px solid black;border-collapse:collapse;'>Street Name</th>
                                                <th style='border:2px solid black;border-collapse:collapse;'>Post Code</th>


                                            </thead>

                                            <tbody>

                                                <tr>
                                                    <td style='border:2px solid black;border-collapse:collapse;'>${serviceToBook.location.country}</td>
                                                    <td style='border:2px solid black;border-collapse:collapse;'>${serviceToBook.location.city}</td>
                                                    <td style='border:2px solid black;border-collapse:collapse;'>${serviceToBook.uniqueFeatures.tripToAddress.streetName}</td>
                                                    <td style='border:2px solid black;border-collapse:collapse;'>${serviceToBook.uniqueFeatures.tripToAddress.postCode}</td>
                                                </tr>

                                            </tbody>

                                        </table>

                                `
                                })

                        }

                    }

                }catch(err){
                    console.log(err)
                }                
        }

        // Return a response to acknowledge receipt of the event
        return res.status(200).json({received: true});

    }

}

//handles finding service bookings for a service provider to track the bookings belonging to one

const findServiceBookings = async (req,res,next) => {

    try{

        const userID = String(req.user._id)

        const services = await serviceModel.find({
            providerID:{
                $eq:userID
            }
        })

        //this will soon be changed or refactored, I did it for data redudancy avoidance and
        //due to NO SQL Database lacking of JOINS

        const servicesIDs = services.map((each) => {
            const {_id} = each
            return String(_id)
        })

        const bookings = await bookingModel.aggregate([

            {$match:{serviceID:{$in:servicesIDs}}},
            {$unwind:"$bookings_information"},
            {$group:{_id:"$serviceID",total:{$sum:1},bookings:{$push:"$bookings_information"}}}

        ])

         filtered = []

        for (let i=0;i<bookings.length;i++){

            filtered = services.map((each) => {

                const {_id,title,price,description,imageURL,category,location} = each

                const newObj = {
                    _id,
                    title,
                    price,
                    description,
                    imageURL,
                    category,
                    location

                }

                const findBooking = bookings.find((each) => {
                    return String(each._id) === String(_id)
                })

                //if(findBooking){
                    newObj["joins1"] = findBooking ? findBooking : {bookings:[]}
               // }


                if(category === "flights" || category === "buses"){
                    const {uniqueFeatures} = each
                    newObj["uniqueFeatures"] = uniqueFeatures
                }

                return newObj

            })


        }
        res.status(200).json({success:true,services:filtered})

    }catch(err){
        console.log(err)
    }

}

module.exports = {makeBooking,confirmBooking,findServiceBookings}