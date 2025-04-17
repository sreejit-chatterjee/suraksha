"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Phone, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { mockDataService } from "@/lib/supabase"

interface Contact {
  id: string
  name: string
  phone: string
  email: string
  relation: string
}

export function EmergencyContacts() {
  const { toast } = useToast()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newContact, setNewContact] = useState({ name: "", phone: "", email: "", relation: "" })
  const [loading, setLoading] = useState(true)

  // Load contacts
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const contactsData = await mockDataService.getEmergencyContacts()
        setContacts(contactsData)
      } catch (error) {
        console.error("Error loading contacts:", error)
      } finally {
        setLoading(false)
      }
    }

    loadContacts()
  }, [])

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newContact.name || (!newContact.phone && !newContact.email)) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and either a phone number or email.",
        variant: "destructive",
      })
      return
    }

    try {
      // Add contact
      const contact = await mockDataService.addEmergencyContact({
        name: newContact.name,
        phone: newContact.phone,
        email: newContact.email || "sreejitc2019@gmail.com", // Use provided email or default
        relation: newContact.relation || "Other",
      })

      // Update local state
      setContacts([...contacts, contact])

      setNewContact({ name: "", phone: "", email: "", relation: "" })
      setIsDialogOpen(false)

      toast({
        title: "Contact Added",
        description: `${newContact.name} has been added to your emergency contacts.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteContact = async (id: string) => {
    try {
      // Delete contact
      await mockDataService.deleteEmergencyContact(id)

      // Update local state
      setContacts(contacts.filter((contact) => contact.id !== id))

      toast({
        title: "Contact Removed",
        description: "The contact has been removed from your emergency contacts.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div
      className="glass-card p-6 rounded-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Phone className="mr-2 h-5 w-5 text-primary-foreground" />
          <h3 className="font-medium">Emergency Contacts</h3>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Emergency Contact</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Contact name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="XXXXXXXXXX"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@example.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relation">Relation</Label>
                <Input
                  id="relation"
                  placeholder="Family, Friend, etc."
                  value={newContact.relation}
                  onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                  className="glass-input"
                />
              </div>
              <Button type="submit" className="w-full">
                Add Contact
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">These contacts will be notified in case of an emergency</p>

        {loading ? (
          <p className="text-center py-4 text-sm text-muted-foreground">Loading contacts...</p>
        ) : contacts.length > 0 ? (
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg bg-white bg-opacity-10">
                <div>
                  <p className="text-sm font-medium">{contact.name}</p>
                  <div className="flex items-center flex-wrap">
                    {contact.phone && (
                      <>
                        <p className="text-xs text-muted-foreground">{contact.phone}</p>
                        {contact.email && <span className="mx-1 text-xs text-muted-foreground">•</span>}
                      </>
                    )}
                    {contact.email && <p className="text-xs text-muted-foreground">{contact.email}</p>}
                    {contact.relation && (
                      <>
                        <span className="mx-1 text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">{contact.relation}</p>
                      </>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteContact(contact.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No emergency contacts added yet</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
