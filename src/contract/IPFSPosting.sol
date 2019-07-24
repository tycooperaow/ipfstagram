pragma solidity 0.5.3;

//Imports for safe math operations
import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol";

//Defining contract name lika class name
contract IPFSPosting{
  using SafeMath for uint256;

  //This struct is for the properties of a post
  struct Post{
    //Address of owner's Post
    address owner;
    //Hash of an image
    string imgHash;
    //Hash of a image caption
    string textHash;
  }

  //A Mapping list post from Post struct.
  mapping(uint256 => Post) post;

  //A counter for the posts mapping list.
  uint256 postCtr;
  event NewPost();
  //img and text hashes are sent to IPFS and stored
  function sendHash(string memory _img, string memory _text)
    public {
      postCtr = postCtr.add(1);
      Post storage posting = post[postCtr];
      posting.owner = msg.sender;
      posting.imgHash = _img;
      posting.textHash = _text;

      emit NewPost();
    }
  // Function that gets the img and text hashes
  // _index number from total post iteration
  // returns stored images and text hashes
  function getHash(uint256 _index)
  public view returns (string memory img, string memory text, address owner)
  {
    owner = post[_index].owner;
    img = post[_index].imgHash;
    text = post[_index].textHash;
  }
  //Gets the total length of total posts
  // Returns the total count of post
  function getCounter() public view returns(uint256){ return postCtr;}
}
