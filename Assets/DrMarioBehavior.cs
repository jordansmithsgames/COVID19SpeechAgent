using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DrMarioBehavior : MonoBehaviour
{
    Animator animator;
    AudioSource audioSource;
    // Start is called before the first frame update
    void Start()
    {
        animator = GetComponent<Animator>();
        audioSource = GetComponent<AudioSource>();
    }

    // Update is called once per frame
    void Update()
    {

    }

    public IEnumerator WaitForEnd(AudioClip audioClip)
    {
        this.audioSource.clip = audioClip;
        this.animator.SetBool("Talking", true);
        this.audioSource.Play();
        yield return new WaitForSeconds(audioClip.length);
        this.animator.SetBool("Talking", false);
    }
}
