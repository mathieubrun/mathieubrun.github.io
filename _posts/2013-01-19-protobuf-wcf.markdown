---
layout: post
title: "Comment utiliser protobuf-net avec WCF"
date: 2013-01-19 -0800
tags: [wcf]
comments: true
---
[Protobuf-net](https://code.google.com/p/protobuf-net/) est l'implémentation .NET de protocol buffers mis au point par Google, qui l'utilise comme protocole de communication pour ses échanges de données. L'objectif est d'obtenir une sérialisation binaire de faible taille (largement moindre qu'une sérialisation XML par exemple), et peu coûteuse a sérialiser et désérialiser, autant coté serveur que client.

L'intérêt de protobuf-net est le gain en performances offert, grâce a une sérialisation plus efficace que le DataContractSerializer utilisé par défaut dans WCF. En utilisant des entités Linq-to-Sql générées à partir de la base Northwind :

- Sérialisation 3x plus rapide
- Désérialisation 4x plus rapide
- Taille 3.5x moindre

Pour l'implémenter rapidement dans un projet existant (afin de valider un gain en performances substantiel), 3 étapes principales a suivre :

Placer un attribut sur les classes devant être sérialisées :

```` csharp
[DataContract]
[ProtoBuf.ProtoContract(ImplicitFields = ProtoBuf.ImplicitFields.AllFields)]
public class CompositeType
{
    public CompositeType()
    {
        this.Children = new List<CompositeTypeChild>
        {
            new CompositeTypeChild { IntValue = 1234, StringValue = "1234" },
            new CompositeTypeChild { IntValue = 5678, StringValue = "5678" }
        };
    }
 
    [DataMember]
    public int IntValue { get; set; }
 
    [DataMember]
    public string StringValue { get; set; }
     
    [DataMember]
    public List<CompositeTypeChild> Children { get; set; }
}
 
[DataContract]
[ProtoBuf.ProtoContract(ImplicitFields = ProtoBuf.ImplicitFields.AllFields)]
public class CompositeTypeChild
{
    [DataMember]
    public int IntValue { get; set; }
 
    [DataMember]
    public string StringValue { get; set; }
}
````

Modifier la configuration du serveur, en rajoutant un endpointBehavior :

```` xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.serviceModel>
    <services>
      <service name="WcfService.Service" behaviorConfiguration="WcfService.ServiceBehavior">
        <endpoint address="" binding="basicHttpBinding" contract="WcfService.IService" behaviorConfiguration="protoEndpointBehavior" />
        <endpoint address="mex" binding="mexHttpBinding" contract="IMetadataExchange"/>
      </service>
    </services>
    <behaviors>
      <serviceBehaviors>
        <behavior name="WcfService.ServiceBehavior">
          <serviceMetadata httpGetEnabled="true"/>
          <serviceDebug includeExceptionDetailInFaults="true"/>
        </behavior>
      </serviceBehaviors>
      <endpointBehaviors>
        <behavior name="protoEndpointBehavior">
          <protobuf/>
        </behavior>
      </endpointBehaviors>
    </behaviors>
    <extensions>
      <behaviorExtensions>
        <add name="protobuf" type="ProtoBuf.ServiceModel.ProtoBehaviorExtension, protobuf-net"/>
      </behaviorExtensions>
    </extensions>
  </system.serviceModel>
</configuration>
````

Modifier la configuration du client :

```` xml
<?xml version="1.0" encoding="utf-8" ?>
<configuration>
  <system.serviceModel>
    <client>
      <endpoint address="http://localhost:1085/Service.svc" binding="basicHttpBinding" contract="ServiceReference.IService"
          behaviorConfiguration="protoEndpointBehavior"
          name="BasicHttpBinding_IService" />
    </client>
    <behaviors>
      <endpointBehaviors>
        <behavior name="protoEndpointBehavior">
          <protobuf/>
        </behavior>
      </endpointBehaviors>
    </behaviors>
    <extensions>
      <behaviorExtensions>
        <add name="protobuf" type="ProtoBuf.ServiceModel.ProtoBehaviorExtension, protobuf-net"/>
      </behaviorExtensions>
    </extensions>
  </system.serviceModel>
</configuration>
````

Et le résultat dans Fiddler :

Avant :

```` xml
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <GetDataUsingDataContractResponse xmlns="http://tempuri.org/">
      <GetDataUsingDataContractResult xmlns:a="http://schemas.datacontract.org/2004/07/WcfService" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
        <a:Children>
          <a:CompositeTypeChild>
            <a:IntValue>1234</a:IntValue>
            <a:StringValue>1234</a:StringValue>
          </a:CompositeTypeChild>
          <a:CompositeTypeChild>
            <a:IntValue>5678</a:IntValue>
            <a:StringValue>5678</a:StringValue>
          </a:CompositeTypeChild>
        </a:Children>
        <a:IntValue>1234</a:IntValue>
        <a:StringValue>1234</a:StringValue>
      </GetDataUsingDataContractResult>
    </GetDataUsingDataContractResponse>
  </s:Body>
</s:Envelope>
````

Apres :

```` xml
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <GetDataUsingDataContractResponse xmlns="http://tempuri.org/">
      <proto>CgkI0gkSBDEyMzQKCQiuLBIENTY3OAoJCNIJEgQxMjM0CgkIriwSBDU2NzgQ0gkaBDEyMzQ=</proto>
    </GetDataUsingDataContractResponse>
  </s:Body>
</s:Envelope>
````