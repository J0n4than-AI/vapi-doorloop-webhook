# MaintenanceBot - Example Call Scenarios

This document provides detailed examples of how the MaintenanceBot Unified Assistant handles different types of calls across its three modes: Intake, Emergency, and Followup.

---

## Example 1: Standard Intake Call (Non-Emergency)

### Scenario: Kitchen Sink Leak

**Tenant**: *[Calls maintenance line]*

**Bot**: Hi! This is MaintenanceBot from Aictive Management. I'm here to help with your maintenance request. Can you start by telling me your unit number?

**Tenant**: Yes, I'm in unit 204.

**Bot**: Thank you! And what's your name?

**Tenant**: Sarah Johnson.

**Bot**: Great, Sarah. What's the best phone number to reach you?

**Tenant**: 555-789-1234.

**Bot**: Perfect, so that's 555-789-1234, correct?

**Tenant**: Yes.

**Bot**: Excellent. Can you describe the issue you're experiencing?

**Tenant**: My kitchen sink is leaking. There's water under the cabinet.

**Bot**: I understand. Let me get a few more details. Is the water actively pouring out, or is it more of a steady drip?

**Tenant**: It's dripping pretty steadily when I turn on the faucet.

**Bot**: Got it. And when did you first notice this?

**Tenant**: This morning when I was making coffee.

**Bot**: Thank you. Is anyone in danger, or is this affecting your ability to use your kitchen?

**Tenant**: No, I can still use the sink, I'm just putting a bucket underneath.

**Bot**: I appreciate you doing that. Let me make sure I have everything correct: You're in unit 204, your name is Sarah Johnson, best phone is 555-789-1234, and you have a kitchen sink leak with steady dripping when the faucet is on. Is there anything else I should know?

**Tenant**: No, that's it.

**Bot**: *[Calls createWorkOrder tool]*

**Bot**: Perfect! I've created work order #WO-5432. This is classified as urgent, so you can expect a call from our technician within 2 hours. They'll reach out to you at 555-789-1234 to schedule the repair. Is there anything else I can help you with?

**Tenant**: No, that's all. Thank you!

**Bot**: You're welcome! We'll take care of this for you. Have a great day!

---

## Example 2: Emergency Escalation (HVAC in Extreme Cold)

### Scenario: No Heat in Winter

**Tenant**: *[Calls maintenance line]*

**Bot**: Hi! This is MaintenanceBot from Aictive Management. I'm here to help with your maintenance request. Can you start by telling me your unit number?

**Tenant**: Unit 105. My heat isn't working and it's freezing outside!

**Bot**: I understand, let me help you right away. What's your name?

**Tenant**: Michael Davis.

**Bot**: Thank you, Michael. What's the best phone number to reach you?

**Tenant**: 555-321-9876.

**Bot**: Got it. Can you tell me more about the heating issue? Is it not coming on at all, or is it just not heating well?

**Tenant**: It's not coming on at all. I've tried turning it up but nothing happens.

**Bot**: I understand. Do you know what the temperature is outside right now?

**Tenant**: It's like 25 degrees. It's really cold.

**Bot**: I understand how stressful this is, especially in this weather. Is anyone at risk right now - do you have children, elderly, or anyone with health concerns?

**Tenant**: Yes, my wife and I have a 2-year-old daughter.

**Bot**: Thank you for letting me know. This is classified as an emergency situation. *[Calls escalateToEmergency tool]* I have your details and I'm going to get help to you right away. First, are you safe right now?

**Tenant**: We're safe, just cold.

**Bot**: I understand. I know how stressful this is. Please stay warm - use blankets, close off any rooms you're not using to keep the heat in, and dress in layers. If the temperature in your unit drops below 50 degrees, please call me back and we'll arrange alternative accommodations. I'm dispatching our emergency HVAC technician right now.

**Bot**: *[Calls dispatchEmergencyVendor tool]*

**Bot**: Perfect. I've just dispatched our emergency technician. Here's what will happen next: The technician will call you at 555-321-9876 within 15 minutes to confirm the issue. They'll arrive within 1-2 hours and will have parts on their truck to restore your heat. Do you have any questions while we wait?

**Tenant**: How long will the repair take?

**Bot**: The technician will assess the issue when they arrive and give you a timeline. For HVAC issues like this, they often can fix it the same day. They'll explain everything once they see it. Is there anything else?

**Tenant**: No, thank you so much.

**Bot**: You're welcome. Help is on the way. The technician will call you shortly. If the temperature drops below 50 degrees or you need anything before then, please don't hesitate to call back.

---

## Example 3: Emergency with Safety Guidance (Major Water Leak)

### Scenario: Burst Pipe

**Tenant**: *[Calls maintenance line, sounds panicked]*

**Bot**: Hi! This is MaintenanceBot from Aictive Management. I'm here to help with your maintenance request. Can you start by telling me your unit number?

**Tenant**: 302! There's water everywhere! The pipe under my sink just burst!

**Bot**: I understand, and I'm going to help you right away. What's your name?

**Tenant**: Tom Richards!

**Bot**: Thank you, Tom. What's the best phone number to reach you?

**Tenant**: 555-456-7890, but please hurry!

**Bot**: I'm on it. Tom, do you know where your main water shut-off valve is? It's usually under the kitchen sink or in a bathroom cabinet.

**Tenant**: I don't know where it is!

**Bot**: That's okay, our technician will handle it. In the meantime, please move any valuable items away from the water if it's safe to do so. Don't try to fix it yourself. I'm dispatching our emergency plumber right now.

**Bot**: *[Calls escalateToEmergency tool]*

**Bot**: *[Calls dispatchEmergencyVendor tool]*

**Bot**: I've just dispatched our emergency plumber. They'll call you at 555-456-7890 within 15 minutes and will arrive within 1-2 hours. They'll shut off the water, stop the leak, and assess any damage. Do you have any other questions?

**Tenant**: Will this cost me anything?

**Bot**: Emergency repairs like this are typically covered by the property owner at no cost to you since this is a habitability issue. The technician will confirm this when they call, but you shouldn't have any out-of-pocket costs. Is there anything else?

**Tenant**: No, thank you.

**Bot**: You're welcome. The technician will call you very shortly. Help is on the way.

---

## Example 4: Followup Call - Everything Perfect

### Scenario: Successful Repair Completion

**Bot**: Hi Sarah, this is MaintenanceBot from Aictive Management. I'm calling about the kitchen sink leak that was recently repaired in unit 204. Do you have a quick minute?

**Tenant**: Sure!

**Bot**: Great! I see that ABC Plumbing completed the repair on Monday. Did they fix the leak?

**Tenant**: Yes, it's working great now.

**Bot**: Excellent! Is everything working properly? No leaks, strange noises, or other issues?

**Tenant**: Nope, all good!

**Bot**: Perfect! How was your experience with the technician? Were they professional, on time, and helpful?

**Tenant**: Yes, they were great. Very professional.

**Bot**: I'm so glad to hear that! Thank you for your patience with this issue. *[Calls confirmCompletion tool]* I'm going to close this work order now. If anything changes or you notice any other issues, just give us a call. Have a great day!

**Tenant**: Thank you!

---

## Example 5: Followup Call - Issue NOT Resolved

### Scenario: Incomplete Repair

**Bot**: Hi Michael, this is MaintenanceBot from Aictive Management. I'm calling about the HVAC issue that was recently repaired in unit 105. Do you have a quick minute?

**Tenant**: Yeah, but the heat is still not working right.

**Bot**: I'm sorry to hear that. Can you tell me what's happening?

**Tenant**: It's blowing air, but it's not warm air. It's barely heating the apartment.

**Bot**: I understand how frustrating this must be. So the system is running, but it's not producing warm enough air to heat your unit adequately?

**Tenant**: Right, exactly.

**Bot**: Thank you for letting me know. I'm going to reopen this work order and have our vendor come back out to properly resolve this. *[Calls reopenWorkOrder tool]* This should be covered at no additional cost since the original issue wasn't fully fixed. When would you be available for them to return?

**Tenant**: I'm home most evenings.

**Bot**: Perfect. I'm going to escalate this and have them contact you today to schedule an evening appointment. You should hear from them within 2 hours. Is there anything else I should know about the issue?

**Tenant**: No, that's it.

**Bot**: I apologize for the inconvenience. We'll make sure this is resolved properly. Someone will call you this afternoon to schedule. Thank you for your patience.

---

## Example 6: Followup Call - Negative Vendor Experience

### Scenario: Vendor Was Late and Didn't Clean Up

**Bot**: Hi Lisa, this is MaintenanceBot from Aictive Management. I'm calling about the electrical repair in unit 412. Do you have a quick minute?

**Tenant**: Sure.

**Bot**: Great! I see that the outlet was repaired on Tuesday. Is it working properly now?

**Tenant**: Yes, the outlet works.

**Bot**: Excellent! How was your experience with the technician? Were they professional, on time, and helpful?

**Tenant**: Honestly, they were really late and didn't clean up after themselves. There's drywall dust all over my floor.

**Bot**: I'm very sorry to hear that. Can you tell me more about what happened?

**Tenant**: They were supposed to come at 2pm but didn't show up until 5pm. And they didn't call to let me know. Then when they finished, they just left all the mess.

**Bot**: I sincerely apologize for that experience. That's not the standard we expect from our vendors. I'm going to document this feedback and share it with our property manager. In the meantime, is the electrical issue fully resolved?

**Tenant**: Yes, the outlet works now.

**Bot**: Good. And regarding the cleanup - would you like us to send someone to help clean the drywall dust, or would you prefer a credit on your rent for the inconvenience?

**Tenant**: A rent credit would be fine.

**Bot**: I'll make a note of that and have our property manager follow up with you about that. *[Calls confirmCompletion tool with negative feedback flagged]* Thank you for bringing this to our attention, and again, I apologize for the poor service. Is there anything else?

**Tenant**: No, that's all.

**Bot**: Thank you for your patience. The property manager will reach out to you within 24 hours about the rent credit.

---

## Example 7: Followup Call - New Separate Issue Discovered

### Scenario: Followup Reveals Additional Problem

**Bot**: Hi Tom, this is MaintenanceBot from Aictive Management. I'm calling about the dishwasher repair that was completed in unit 307. Do you have a quick minute?

**Tenant**: Yeah, the dishwasher works now, but I noticed the kitchen sink is draining really slowly.

**Bot**: I'm glad the dishwasher is working! Let me ask about the sink - was it draining slowly before the dishwasher repair, or is this something new you just noticed?

**Tenant**: I'm not sure, I think it's been like that for a while.

**Bot**: Okay, thank you for letting me know. The slow drain sounds like a separate issue from the dishwasher. Let me create a new work order for that so we can get it taken care of. Would you like me to do that now?

**Tenant**: Yes please.

**Bot**: Great! Can you describe what's happening with the sink drain?

**Tenant**: Water just drains really slowly, takes like 5 minutes for the sink to empty.

**Bot**: Got it. And is this affecting your ability to use the sink?

**Tenant**: Not really, it's just annoying.

**Bot**: I understand. Let me make sure I have this right - you're in unit 307, Tom Richards, and your kitchen sink is draining very slowly, takes about 5 minutes to empty. Is there anything else I should know?

**Tenant**: No, that's it.

**Bot**: *[Calls createWorkOrder tool]* Perfect! I've created work order #WO-5434 for the slow drain. This is classified as standard priority, so you can expect a call from our technician within 24 hours. Now let me close out the dishwasher work order. *[Calls confirmCompletion tool]* Is there anything else I can help you with?

**Tenant**: No, thank you!

**Bot**: You're welcome! We'll take care of the drain issue. Have a great day!

---

## Example 8: Pricing Question During Intake

### Scenario: Tenant Concerned About Cost

**Bot**: Hi! This is MaintenanceBot from Aictive Management. I'm here to help with your maintenance request. Can you start by telling me your unit number?

**Tenant**: 501. My dishwasher stopped working.

**Bot**: I'm sorry to hear that. Let me get some information. What's your name?

**Tenant**: Jennifer Lee.

**Bot**: Thank you, Jennifer. What's the best phone number to reach you?

**Tenant**: 555-111-2222.

**Bot**: Perfect. Can you describe what's happening with the dishwasher?

**Tenant**: It won't start at all. I press the buttons but nothing happens.

**Bot**: Got it. When did you first notice this?

**Tenant**: Last night after dinner.

**Bot**: Thank you. Before I submit this, how much is this going to cost me?

**Bot**: I understand you want to know about the cost. Our dispatch team will provide pricing after the technician assesses the issue. Many repairs are covered under normal maintenance at no cost to you, but the technician will explain everything when they call. The most important thing is getting someone out to assess what's wrong.

**Tenant**: Okay, that makes sense.

**Bot**: Let me confirm the details: Unit 501, Jennifer Lee, phone 555-111-2222, dishwasher not starting at all since last night. Is there anything else I should know?

**Tenant**: No, that's it.

**Bot**: *[Calls createWorkOrder tool]* Perfect! I've created work order #WO-5435. You can expect a call from our technician within 24 hours to schedule the repair. They'll also discuss any costs at that time. Is there anything else I can help you with?

**Tenant**: No, thank you.

**Bot**: You're welcome! Have a great day.

---

## Example 9: Emergency Status Update Request

### Scenario: Tenant Asks for Update During Emergency

**Bot**: *[After dispatching emergency vendor]* The technician will call you at 555-321-9876 within 15 minutes and arrive within 1-2 hours. Do you have any questions while we wait?

**Tenant**: It's been 20 minutes and I haven't heard from them yet.

**Bot**: I understand your concern. Let me check on the status for you. *[Calls provideStatus tool]* The technician is currently en route and should arrive in about 45 minutes. They'll call you shortly if they haven't already. Their direct number is 555-999-8888 if you need to reach them. Is there anything else I can help you with?

**Tenant**: No, that helps. Thank you.

**Bot**: You're welcome. The technician should be calling you very soon. If you don't hear from them in the next 10 minutes, please call me back and I'll follow up again.

---

## Example 10: Followup with Inspection Required

### Scenario: Major Repair Requiring Manager Inspection

**Bot**: Hi John, this is MaintenanceBot from Aictive Management. I'm calling about the HVAC system replacement in unit 608. Do you have a quick minute?

**Tenant**: Sure!

**Bot**: Great! I see that ABC HVAC completed the installation on Friday. Is the new system working properly?

**Tenant**: Yes, it's working great. The apartment is much more comfortable now.

**Bot**: Excellent! How was your experience with the technician? Were they professional, on time, and helpful?

**Tenant**: Yes, they did a great job. Very professional.

**Bot**: I'm so glad to hear that! For repairs of this nature, we typically schedule a brief manager inspection to ensure quality. Would you be available for a 10-minute inspection this week?

**Tenant**: Sure, I'm available Wednesday or Thursday afternoon.

**Bot**: Perfect. *[Calls scheduleInspection tool]* I've scheduled a brief inspection for Wednesday at 2pm with our property manager, Jane Smith. They'll do a quick walkthrough to verify everything is good. You should receive a calendar invite shortly. Does that work for you?

**Tenant**: Yes, that works.

**Bot**: Great! *[Calls confirmCompletion tool]* Thank you for your patience with this issue. If anything changes before the inspection or you notice any other problems, just give us a call. Have a great day!

**Tenant**: Thank you!

---

## Key Takeaways from Examples

### What Makes These Calls Effective

1. **Systematic Data Collection**: Bot always collects information in the same order
2. **Empathy First**: Bot acknowledges tenant stress and frustration
3. **Safety Priority**: Emergency mode always checks safety first
4. **Clear Expectations**: Bot always sets specific timelines
5. **Confirmation**: Bot repeats details back to ensure accuracy
6. **Professional Boundaries**: Bot never gives repair advice or quotes prices
7. **Proper Tool Usage**: Bot calls the right tool at the right time
8. **Graceful Handling**: Bot handles unexpected situations smoothly

### Common Patterns

- **Always use tenant's name** after they provide it
- **Always confirm phone number** by repeating it back
- **Always ask "Is there anything else I should know?"** before creating work order
- **Always set clear expectations** about response time
- **Always end with** "Is there anything else I can help you with?"

### Mode Detection

The bot intelligently detects which mode to use:

- **Intake Mode**: Triggered by tenant reporting a new problem
- **Emergency Mode**: Triggered by urgency classification (temperature, flooding, safety)
- **Followup Mode**: Triggered by mention of "completed repair" or "calling about repair"

---

## Testing Your Assistant

Use these scenarios to test your MaintenanceBot:

- [ ] Standard intake (sink leak)
- [ ] Emergency escalation (no heat in cold weather)
- [ ] Emergency with safety guidance (burst pipe)
- [ ] Followup - everything perfect
- [ ] Followup - issue not resolved
- [ ] Followup - negative vendor experience
- [ ] Followup - new issue discovered
- [ ] Pricing questions
- [ ] Emergency status update
- [ ] Inspection scheduling

Your assistant should handle all of these smoothly!
