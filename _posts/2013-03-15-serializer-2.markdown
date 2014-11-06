---
layout: post
title: "Implémentation naïve d'un Serializer en C# - Partie 2"
date: 2013-03-29 -0800
categories: [c#, code]
comments: true
---

Pour la suite de cette série, je vais vous présenter le fonctionnement de la 1ere itération du serializer. Cette version supporte les types de base, nullables ou non, ainsi que les graphes d'objets simples (pas de cycles, pas de tableaux).

Dans un premier temps, le serializer va détecter le type de l'objet passé en paramètre. Si il s'agit d'un type valeur standard, celui ci est écrit dans le flux.

```` csharp
private void SerializeBase(Type t, object ob, ExtendedBinaryWriter bw)
{
	var b = Type.GetTypeCode(t);

	switch (b)
	{
		case TypeCode.Boolean:
			bw.Write((Boolean)ob);
			break;
		case TypeCode.Decimal:
			bw.Write((Decimal)ob);
			break;
		case TypeCode.Byte:
			bw.Write((Byte)ob);
			break;
		// et ainsi de suite ...
		case TypeCode.Object:
			SerializeObject(t, ob, bw);
			break;
	}
}
````

Si il s'agit d'un objet, celui ci sera inspecté. Cette inspection servira a déterminer si il s'agit d'un Nullable, ou d'un autre type d'objet. Dans les deux cas, on écrira dans le flux un booléen indiquant si l'objet est null.

```` csharp
private void SerializeObject(Type t, object ob, ExtendedBinaryWriter bw)
{
	var hasValue = ob != null;

	bw.Write(hasValue);

	if (t.IsGenericType && t.GetGenericTypeDefinition() == typeof(Nullable<>))
	{
		if (hasValue)
		{
			var val = t.GetProperty("Value").GetValue(ob, null);
			SerializeBase(val.GetType(), val, bw);
		}

		return;
	}

	if (hasValue)
	{
		foreach (var prop in t.GetProperties().OrderBy(x => x.Name))
		{
			SerializeBase(prop.PropertyType, prop.GetValue(ob, null), bw);
		}
	}
}
````

L'écriture dans le flux se fait au travers de la classe BinaryWriter, étendue pour gérer les cas spécifiques. La classe BinaryWriter de base ne supportant les chaines nulles, la méthode Write(string) est surchargée pour gérer ce cas.

```` csharp
public override void Write(string value)
{
	var hasValue = value != null;

	Write(hasValue);

	if (hasValue)
		base.Write(value);
}
````

La désérialisation suit le même principe, le flux d'octets est lu à l'aide d'une implémentation spécifique de la classe BinaryReader, et l'objet est reconstitué.

```` csharp
private object DeserializeObject(Type t, object target, ExtendedBinaryReader s)
{
	target = Activator.CreateInstance(t);
	var hasValue = s.ReadBoolean();

	if (t.IsGenericType && t.GetGenericTypeDefinition() == typeof(Nullable<>))
	{

		if (hasValue)
		{
			return DeserializeBase(target, t.GetGenericArguments().First(), s);
		}

		return null;
	}

	if (hasValue)
	{
		foreach (var prop in t.GetProperties().OrderBy(x => x.Name))
		{
			var v = DeserializeBase(target, prop.PropertyType, s);
			prop.SetValue(target, v, null);
		}
	}

	return target;
}
````

Le code source de cet article est disponible sur [GitHub](https://github.com/mathieubrun/Samples.SerializerFun).