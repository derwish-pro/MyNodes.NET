﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SerialController_Windows.Code
{
    public class MessagesLog
    {
        private List<Message> messages = new List<Message>();

        public List<Message> GetAllMessages()
        {
            return messages;
        }

        public List<Message> GetLastMessages(int count)
        {
            List<Message> result = messages.Skip(
                Math.Max(0, messages.Count() - count)).ToList();

            return result;
        }

        public void AddNewMessage(Message message)
        {
            messages.Add(message);
        }

        public void ClearLog()
        {
            messages.Clear();
        }

        public List<Message> GetFilteredMessages(
            int? nodeId = null,
            int? sensorId = null,
            MessageType? messageType = null
            )
        {
            List<Message> result = messages;
            result = FilterMessages(result, nodeId, sensorId, messageType);

            return result;
        }

        public List<Message> FilterMessages(
            List<Message> messages,
            int? nodeId = null,
            int? sensorId = null,
            MessageType? messageType = null)
        {

            IEnumerable<Message> result = messages;

            if (nodeId!=null)
                result = from x in result
                         where x.nodeId == nodeId
                        select x;

            if (sensorId != null)
                result = from x in result
                              where x.sensorId == sensorId
                              select x;


            if (messageType != null)
                result = from x in result
                         where x.messageType == messageType
                              select x;



            return result.ToList();
        }


        public List<int> GetAllNodesId()
        {
            List<int> result = new List<int>();

            foreach (Message message in messages)
            {
                if (!result.Contains(message.nodeId))
                    result.Add(message.nodeId);
            }

            return result;
        }

        public List<int> GetAllSensorsId()
        {
            List<int> result = new List<int>();

            foreach (Message message in messages)
            {
                if (!result.Contains(message.sensorId))
                    result.Add(message.sensorId);
            }

            return result;
        }

        public List<MessageType> GetAllMessageTypes()
        {
            List<MessageType> result = new List<MessageType>();

            foreach (Message message in messages)
            {
                if (!result.Contains(message.messageType))
                    result.Add(message.messageType);
            }

            return result;
        }
    }
}
