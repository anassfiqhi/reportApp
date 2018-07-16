using Uno;
using Uno.UX;
using Uno.Collections;
using Fuse;
using Fuse.Scripting;
using Uno.Compiler.ExportTargetInterop;

[UXGlobalModule]
public class Recorder: NativeModule {
	public Recorder() {
		AddMember(new NativeFunction("startRecording", (NativeCallback)StartRecording));
		AddMember(new NativeFunction("stopRecording", (NativeCallback)StopRecording));
		AddMember(new NativeFunction("playRecording", (NativeCallback)PlayRecording));
	}

	object StartRecording(Context c, object[] args) {
		StartRecording();
        return null;
	}

	object StopRecording(Context c, object[] args) {
		StopRecording();
        return null;
	}

	object PlayRecording(Context c, object[] args) {
		return PlayRecording();
	}

    [Foreign(Language.Java)]
	static extern(Android) void StartRecording()
	@{
		com.dirisu.reportapp.Recorder recorder_ = com.dirisu.reportapp.Recorder.getInstance();
		recorder_.Start();
	@}

    static extern(!Android) void StartRecording() {
		debug_log("Recording not supported on this platform.");
	}

	[Foreign(Language.Java)]
	static extern(Android) void StopRecording()
	@{
		com.dirisu.reportapp.Recorder recorder = com.dirisu.reportapp.Recorder.getInstance();
		recorder.Stop();
	@}

	static extern(!Android) void StopRecording() {
		debug_log("Recording not supported on this platform.");
	}

	[Foreign(Language.Java)]
	static extern(Android) string PlayRecording()
	@{
		com.dirisu.reportapp.Recorder player = com.dirisu.reportapp.Recorder.getInstance();
		return player.Play();
	@}

	static extern(!Android) string PlayRecording() {
		debug_log("Mediaplayer not supported on this platform.");
        return "Mediaplayer not supported on this platform.";
	}

}