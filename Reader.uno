using Uno;
using Uno.Collections;
using Fuse;
using Fuse.Scripting;
using Fuse.Reactive;
using Uno.IO;

public class Reader : NativeModule
{
    public Reader()
    {
        AddMember(new NativeFunction("FileWrite", (NativeCallback)FileWrite));
        AddMember(new NativeFunction("FileRead", (NativeCallback)FileRead));
    }

    static object FileWrite(Context c, object[] args)
    {
        if (args.Length != 2) throw new Error("FileWrite(): takes 2 arguments, " + args.Length.ToString() + " provided");

        string filepath = args[0] as string;
        byte[] text = args[1] as byte[];

        if (filepath == null) throw new Error("FileWrite(): filepath argument must be string");
        if (text == null) throw new Error("FileWrite(): text argument must be string");

        Uno.IO.File.WriteAllBytes(filepath, text);

        return null;
    }

    static object FileRead(Context c, object[] args)
    {
        if (args.Length != 1) throw new Error("FileRead(): takes 1 argument, " + args.Length.ToString() + " provided");

        string filepath = args[0] as string;

        if (filepath == null) throw new Error("FileRead(): argument must be string");

        byte[] text = Uno.IO.File.ReadAllBytes(filepath);

        return text;
    }
}