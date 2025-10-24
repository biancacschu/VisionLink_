import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { Send, Search, Plus, MessageSquare, Users, Hash, MoreVertical, Paperclip, Smile } from "lucide-react"

const channels = [
  {
    id: 1,
    name: "general",
    type: "public",
    description: "General team discussions",
    unreadCount: 3,
    lastMessage: "Great work on the 3D renders!",
    lastActivity: "2 hours ago",
  },
  {
    id: 2,
    name: "penthouse-renovation",
    type: "project",
    description: "Modern penthouse renovation project",
    unreadCount: 7,
    lastMessage: "Client approved the material samples",
    lastActivity: "30 mins ago",
  },
  {
    id: 3,
    name: "hotel-lobby",
    type: "project",
    description: "Boutique hotel lobby design team",
    unreadCount: 2,
    lastMessage: "Site visit scheduled for tomorrow",
    lastActivity: "1 hour ago",
  },
  {
    id: 4,
    name: "design-team",
    type: "team",
    description: "Interior design team discussions",
    unreadCount: 0,
    lastMessage: "New furniture catalog uploaded",
    lastActivity: "3 hours ago",
  },
]

const messages = [
  {
    id: 1,
    channelId: 1,
    user: "Sarah Chen",
    message: "Hey team! I've just uploaded the latest living room 3D renders to the files section. Would love to get everyone's feedback before we present to the Richardsons tomorrow.",
    timestamp: "10:30 AM",
    date: "Today",
    isOwn: false,
  },
  {
    id: 2,
    channelId: 1,
    user: "Mike Johnson", 
    message: "Looks stunning! The new lighting really highlights the marble feature wall beautifully. Just one suggestion - maybe we could adjust the accent lighting behind the sofa for more warmth?",
    timestamp: "10:35 AM",
    date: "Today",
    isOwn: false,
  },
  {
    id: 3,
    channelId: 1,
    user: "You",
    message: "Great point Mike! I'll adjust the lighting temperature right now. Sarah, should I also update the material textures to match the latest samples we received?",
    timestamp: "10:37 AM", 
    date: "Today",
    isOwn: true,
  },
  {
    id: 4,
    channelId: 1,
    user: "Emily Rodriguez",
    message: "Perfect timing! I was just reviewing the material palette. Yes, the new marble samples have a slightly different veining pattern that should be reflected in the renders.",
    timestamp: "10:40 AM",
    date: "Today", 
    isOwn: false,
  },
  {
    id: 5,
    channelId: 1,
    user: "David Kim",
    message: "Excellent work everyone! âœ¨ The Richardsons are going to be thrilled. I've also prepared the material specification sheets to accompany the presentation.",
    timestamp: "10:45 AM",
    date: "Today",
    isOwn: false,
  },
]

const teamMembers = [
  { name: "Sarah Chen", status: "online", role: "Lead Designer" },
  { name: "Mike Johnson", status: "online", role: "Frontend Developer" },
  { name: "Emily Rodriguez", status: "away", role: "UX Designer" },
  { name: "David Kim", status: "online", role: "Tech Lead" },
  { name: "Alex Thompson", status: "offline", role: "Backend Developer" },
  { name: "Lisa Wang", status: "online", role: "Project Manager" },
]

export function Messages() {
  const [selectedChannel, setSelectedChannel] = useState(channels[0])
  const [messageInput, setMessageInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const channelMessages = messages.filter(msg => msg.channelId === selectedChannel.id)

  const sendMessage = () => {
    if (messageInput.trim()) {
      // In a real app, this would send the message to the backend
      console.log("Sending message:", messageInput)
      setMessageInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getChannel = (type: string) => {
    switch(type) {
      case 'public': return Hash
      case 'project': return MessageSquare  
      case 'team': return Users
      default: return MessageSquare
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Messages</h1>
          <p className="text-muted-foreground">Team communication and project discussions</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4 h-[700px]">
        {/* Sidebar - Channels and Team */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Channels</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[250px]">
              <div className="p-4 space-y-2">
                {filteredChannels.map((channel) => {
                  const IconComponent = getChannel(channel.type)
                  return (
                    <div
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-accent ${
                        selectedChannel.id === channel.id ? 'bg-accent' : ''
                      }`}
                    >
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{channel.name}</p>
                          {channel.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                              {channel.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{channel.lastMessage}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-4">
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Team Members
              </h3>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.name} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {(() => {
                  const IconComponent = getChannel(selectedChannel.type)
                  return <IconComponent className="h-5 w-5 text-muted-foreground" />
                })()}
                <div>
                  <CardTitle className="text-lg">#{selectedChannel.name}</CardTitle>
                  <CardDescription>{selectedChannel.description}</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {channelMessages.map((msg) => (
                  <div key={msg.id} className={`flex space-x-3 ${msg.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!msg.isOwn && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {msg.user.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`flex-1 ${msg.isOwn ? 'text-right' : ''}`}>
                      {!msg.isOwn && (
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium">{msg.user}</p>
                          <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                        </div>
                      )}
                      <div className={`inline-block p-3 rounded-lg max-w-[70%] ${
                        msg.isOwn 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        {msg.isOwn && (
                          <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-end space-x-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Textarea
                    placeholder={`Message #${selectedChannel.name}...`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button onClick={sendMessage} disabled={!messageInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



