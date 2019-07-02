module.exports = {
  development: {
    port: process.env.PORT || 3000,
    saltingRounds: 5
  },
  production:{
    port:process.env.PORT || 8000,
    saltingRounds:10
  }
}