const express = require("express")
const {findOffers} = require("../crud/offers")

const OffersRouter = express.Router()

OffersRouter.get(`/`,findOffers)

module.exports = OffersRouter