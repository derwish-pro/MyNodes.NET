﻿/*  MyNetSensors 
    Copyright (C) 2015 Derwish <derwish.pro@gmail.com>
    License: http://www.gnu.org/licenses/gpl-3.0.txt  
*/

using System.Collections.Generic;

namespace MyNetSensors.Gateways.MySensors.Serial
{
    public interface IMySensorsRepository
    {
        event LogEventHandler OnLogInfo;
        event LogEventHandler OnLogError;

        int AddNode(Node node);
        void UpdateNode(Node node);
        void RemoveNode(int id);

        int AddSensor(Sensor sensor);
        void UpdateSensor(Sensor sensor);

        List<Node> GetNodes();
        Node GetNode(int id);
        Sensor GetSensor(int nodeId, int sensorId);
        void RemoveAllNodesAndSensors();
        

        void SetWriteInterval(int ms);
    }
}
