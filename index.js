const ms = require('ms')
const fetch = require('node-fetch')
const Discord = require('discord.js')
const client = new Discord.Client()

const config = require('./config.json')

/**
 * This function is used to update statistics channel
 */
const updateChannel = async () => {

    // Fetch statistics from mcapi.us
    const res = await fetch(`https://mcapi.us/server/status?ip=${config.ipAddress}${config.port ? `&port=${config.port}` : ''}`)
    if (!res) {
        const statusChannelName = `【🛡】Status: Offline`
        client.channels.cache.get(config.statusChannel).setName(statusChannelName)
        return false
    }
    // Parse the mcapi.us response
    const body = await res.json()

    // Get the current player count, or set it to 0
    const players = body.players.now

    // Get the server status
    const status = (body.online ? "Online" : "Offline")

    // Generate channel names
    const playersChannelName = `【👥】Players: ${players}`
    const statusChannelName = `【🛡】Status: ${status}`

    // Update channel names
    client.channels.cache.get(config.playersChannel).setName(playersChannelName)
    client.channels.cache.get(config.statusChannel).setName(statusChannelName)

    return true
}

client.on('ready', () => {
    console.log(`Ready. Logged as ${client.user.tag}.`)
    setInterval(() => {
        updateChannel()
    }, ms(config.updateInterval))
})

client.on('message', async (message) => {

    if(message.content === `${config.prefix}force-update`){
        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return message.channel.send('Only server moderators can run this command!')
        }
        const sentMessage = await message.channel.send("Updating the channels, please wait...")
        await updateChannel()
        sentMessage.edit("Channels were updated successfully!")
    }

    if(message.content === `${config.prefix}stats`){
        const sentMessage = await message.channel.send("Fetching statistics, please wait...")

        // Fetch statistics from mcapi.us
        const res = await fetch(`https://mcapi.us/server/status?ip=${config.ipAddress}${config.port ? `&port=${config.port}` : ''}`)
        if (!res) return message.channel.send(`Looks like your server is not reachable... Please verify it's online and it isn't blocking access!`)
        // Parse the mcapi.us response
        const body = await res.json()

        const attachment = new Discord.MessageAttachment(Buffer.from("https://proxy.mc-market.org/f55a14af93f66030c17c4a6cf19d1dfb1de51bb5?url=https%3A%2F%2Fi.gyazo.com%2F12ea464af0e608db5aa5f487285d8416.png"), "icon.png")

        const embed = new Discord.MessageEmbed()
            .setAuthor(config.ipAddress)
            //.setImage("https://proxy.mc-market.org/f55a14af93f66030c17c4a6cf19d1dfb1de51bb5?url=https%3A%2F%2Fi.gyazo.com%2F12ea464af0e608db5aa5f487285d8416.png")
            .setThumbnail("https://proxy.mc-market.org/f55a14af93f66030c17c4a6cf19d1dfb1de51bb5?url=https%3A%2F%2Fi.gyazo.com%2F12ea464af0e608db5aa5f487285d8416.png")
            .addField("Version", body.server.name)
            .addField("Connected", `${body.players.now} players`)
            .addField("Maximum", `${body.players.max} players`)
            .addField("Status", (body.online ? "Online" : "Offline"))
            .setColor("#FF0000")
            .setFooter("Open Source Minecraft Discord Bot")
        
        sentMessage.edit(`:chart_with_upwards_trend: Here are the stats for **${config.ipAddress}**:`, { embed })
    }

})

client.login(config.token)
